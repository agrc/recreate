'''
RecreatePallet.py

A module that contains a pallet definition for data to support the recreate app.
'''
from os import rename
from os.path import abspath, basename, dirname, join

import arcpy
import RecreateSecrets as secrets
from forklift.models import Pallet

#: feature class names
Trailheads = 'Trailheads'
RouteLines = 'RouteLines'
RouteToTrailheads = 'RouteToTrailheads'
UtahParksAndMonuments = 'UtahParksAndMonuments'
BoatRamps = 'BoatRamps'
POI = 'POI'
interpolated = join(arcpy.env.scratchGDB, 'interpolatedRouteLines')
profile_points_max_num = 100
meters_to_feet = 3.28084

#: field names
fldType = 'Type'
fldName = 'Name'
fldID = 'ID'
fldOBJECTID = 'OBJECTID'
fldRouteID = 'RouteID'
fldUSNG_TH = 'USNG_TH'
fldRouteName = 'RouteName'
fldElevationGain = 'ElevationGain'
fldElevationProfile = 'ElevationProfile'

#: type, name field, id field, definition query
POI_LAYER_INFOS = {
    UtahParksAndMonuments: ('p', 'NAME', 'FeatureID', None),
    BoatRamps: ('w', 'Name', 'FeatureID', None)
}
WGS = arcpy.SpatialReference(4326)
TRAILS_DATA = [Trailheads, RouteLines, RouteToTrailheads]
TRAILS_POI_TYPE = 'h'


class RecreatePallet(Pallet):
    def build(self, config):
        self.sgid = join(self.garage, 'SGID10.sde')
        self.trails = join(self.garage, 'UtahTrails as TrailsAdmin.sde')
        self.recreate = join(self.staging_rack, 'recreate.gdb')
        self.destination_coordinate_system = WGS
        self.geographic_transformation = 'WGS_1984_(ITRF00)_To_NAD_1983'

        current_directory = abspath(dirname(__file__))
        self.add_crates(TRAILS_DATA, {'source_workspace': self.trails, 'destination_workspace': self.recreate})
        self.add_crates([BoatRamps], {'source_workspace': self.sgid, 'destination_workspace': self.recreate})
        self.add_crates([UtahParksAndMonuments], {
            'source_workspace': join(current_directory, '..', 'data', 'ParksAndMonuments.gdb'),
            'destination_workspace': self.recreate
        })

        output_folder = join(current_directory, '..', 'src')

        self.poi_json = join(output_folder, 'PointsOfInterest.json')
        self.poi = join(self.recreate, POI)

        self.copy_data = [self.recreate]
        self.arcgis_services = [('Recreate', 'MapServer')]

        self.update_route_lines_elevation_data()

    def requires_processing(self):
        return not arcpy.Exists(self.poi) or super(RecreatePallet, self).requires_processing()

    def process(self):
        poi_was_newly_created = False

        #: build poi layer
        if not arcpy.Exists(self.poi):
            self.log.info('creating poi layer')
            arcpy.management.CreateFeatureclass(self.recreate, POI, geometry_type='POINT', spatial_reference=WGS)
            arcpy.management.AddField(self.poi, fldType, 'TEXT', field_length=2)
            arcpy.management.AddField(self.poi, fldName, 'TEXT', field_length=50)
            arcpy.management.AddField(self.poi, fldID, 'TEXT', field_length=40)
            poi_was_newly_created = True
        else:
            self.log.info('updating poi layer')

        #: process non-trails layers
        for crate in self.get_crates():
            if crate.destination_name in POI_LAYER_INFOS and (crate.was_updated() or poi_was_newly_created):
                self.import_data(crate.destination, *POI_LAYER_INFOS[crate.destination_name])

        #: process trails data
        if any([crate.was_updated() or poi_was_newly_created for crate in self.get_crates() if crate.destination_name in TRAILS_DATA]):
            self.log.info('updating trails poi data')
            self.remove_previous_poi_data(TRAILS_POI_TYPE)

            #: build trailhead shape look up
            heads = {}
            with arcpy.da.SearchCursor(join(self.recreate, Trailheads), [fldUSNG_TH, 'Shape@']) as heads_cursor:
                for thid, shape in heads_cursor:
                    heads[thid] = shape

            #: build route name look up
            names = {}
            with arcpy.da.SearchCursor(join(self.recreate, RouteLines), [fldRouteID, fldRouteName]) as names_cursor:
                for routeID, name in names_cursor:
                    names[routeID] = name

            with arcpy.da.SearchCursor(join(self.recreate, RouteToTrailheads), [fldRouteID, fldUSNG_TH]) as route_heads_cursor, \
                    arcpy.da.InsertCursor(self.poi, [fldType, fldName, fldID, 'Shape@']) as poi_cursor:
                for routeID, thid in route_heads_cursor:
                    #: make sure that this route is in RouteLines
                    if routeID in names:
                        poi_cursor.insertRow((TRAILS_POI_TYPE, names[routeID], routeID, heads[thid]))

        #: export to geojson
        if arcpy.Exists(self.poi_json):
            self.log.info('removing old poi geojson file')
            arcpy.management.Delete(self.poi_json)
        geojson_output = arcpy.conversion.FeaturesToJSON(self.poi, self.poi_json, geoJSON='GEOJSON')
        rename(geojson_output[0], self.poi_json)

    def remove_previous_poi_data(self, poi_type):
        with arcpy.da.UpdateCursor(self.poi, [fldID], '{} = \'{}\''.format(fldType, poi_type)) as delete_cursor:
            for row in delete_cursor:
                delete_cursor.deleteRow()

    def import_data(self, feature_class, poi_type, name_field, id_field, query):
        self.log.info('updating {} poi data'.format(basename(feature_class)))
        described = arcpy.Describe(feature_class)

        #: convert polygons to points
        if described.shapetype == 'Polygon':
            feature_class = arcpy.management.FeatureToPoint(feature_class, 'in_memory\{}'.format(basename(feature_class)))

        self.remove_previous_poi_data(poi_type)

        #: load new data
        with arcpy.da.SearchCursor(feature_class, [name_field, id_field, 'Shape@'], query) as search_cursor, \
                arcpy.da.InsertCursor(self.poi, [fldType, fldName, fldID, 'Shape@']) as insert_cursor:
            for name, feature_id, shape in search_cursor:
                insert_cursor.insertRow((poi_type, name, feature_id, shape))

    def update_route_lines_elevation_data(self):
        #: check to see if there is new data that needs to be calculated
        route_lines = join(self.trails, 'UtahTrails.TRAILSADMIN.' + RouteLines)
        dem = join(self.sgid, 'SGID10.RASTER.USGS_DEM_10Meter')

        route_lines_layer = arcpy.management.MakeFeatureLayer(route_lines, 'route_lines_layer', '{} IS NULL'.format(fldElevationProfile))
        if int(arcpy.management.GetCount(route_lines_layer)[0]) > 0:
            if arcpy.Exists(interpolated):
                self.log.info('cleaning up old interpolated output')
                arcpy.management.Delete(interpolated)

            self.log.info('interpolating shapes')
            arcpy.ddd.InterpolateShape(dem, route_lines_layer, interpolated, method='BILINEAR')
            interpolated_lookup = {}
            with arcpy.da.SearchCursor(interpolated, [fldRouteID, 'Shape@']) as cursor:
                for routeID, shape in cursor:
                    interpolated_lookup[routeID] = shape

            self.log.info('updating elevation gains and profiles')
            with arcpy.da.Editor(self.trails):
                with arcpy.da.UpdateCursor(route_lines_layer, [fldRouteID, fldElevationGain, fldElevationProfile]) as cursor:
                    for routeID, gain, profile in cursor:
                        interp_line = interpolated_lookup[routeID]
                        gain = self.calculate_elevation_gain(interp_line)
                        profile = self.generate_elevation_profile(interp_line)

                        cursor.updateRow((routeID, gain, profile))

    def calculate_elevation_gain(self, line):
        if line.partCount > 1:
            self.log.error('MULTI-PART LINE Detected!!')

        gain = 0
        previous_elevation = None
        for point in line.getPart(0):
            if previous_elevation is not None and previous_elevation < point.Z:
                gain += point.Z - previous_elevation

            previous_elevation = point.Z

        return round(gain * meters_to_feet)

    def generate_elevation_profile(self, line):
        elevations = [point.Z * meters_to_feet for point in line.getPart(0)]

        #: generalize elevations if there are more than the max num
        num_points = len(elevations)
        if num_points > profile_points_max_num:
            factor = round(num_points/profile_points_max_num)
            generalized_elevations = []
            for index in range(0, num_points - 1, factor):
                generalized_elevations.append(elevations[index])

            elevations = generalized_elevations

        #: convert elevations to percentages (of max - min) to save on space
        max_elevation = max(elevations)
        min_elevation = min(elevations)

        percent_elevations = []
        for elev in elevations:
            percent_elevations.append(str(round(((elev - min_elevation) / (max_elevation - min_elevation)) * 100)))

        return ','.join([str(round(min_elevation)), str(round(max_elevation))] + percent_elevations)
