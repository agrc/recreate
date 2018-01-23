'''
RecreatePallet.py

A module that contains a pallet definition for data to support the recreate app.
'''
from os.path import basename, join

import arcpy
import RecreateSecrets as secrets
from forklift.models import Crate, Pallet

#: feature class names
Trailheads = 'Trailheads'
RouteLines = 'RouteLines'
RouteToTrailheads = 'RouteToTrailheads'
UtahParksAndMonuments = 'UtahParksAndMonuments'
BoatRamps = 'BoatRamps'
POI = 'POI'

#: field names
fldType = 'Type'
fldName = 'Name'
fldID = 'ID'
fldOBJECTID = 'OBJECTID'
fldRouteID = 'RouteID'
fldUSNG_TH = 'USNG_TH'
fldRouteName = 'RouteName'

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
        sgid = join(self.garage, 'SGID10.sde')
        trails = join(self.garage, 'UtahTrails as TrailsViewer.sde')
        self.recreate = join(self.staging_rack, 'recreate.gdb')
        self.destination_coordinate_system = WGS
        self.geographic_transformation = 'WGS_1984_(ITRF00)_To_NAD_1983'

        self.add_crates(TRAILS_DATA, {'source_workspace': trails, 'destination_workspace': self.recreate})
        self.add_crates([BoatRamps], {'source_workspace': sgid, 'destination_workspace': self.recreate})
        self.add_crates([UtahParksAndMonuments], {'source_workspace': secrets.KDRIVE, 'destination_workspace': self.recreate})

        if config == 'Production':
            output_folder = r'\\{}\c$\recreate-web'.format(secrets.PROD_SERVER_IP)
        elif config == 'Staging':
            output_folder = r'\\{}\c$\inetpub\wwwroot\recreate-web'.format(secrets.TEST_SERVER_IP)
        else:
            output_folder = r'X:\recreate-web\public'

        self.poi_json = join(output_folder, 'PointsOfInterest.json')
        self.poi = join(self.recreate, POI)

        self.copy_data = [self.recreate]
        self.arcgis_services = [('Recreate', 'MapServer')]

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
            if crate.destination_name in POI_LAYER_INFOS and (self.data_was_changed(crate) or poi_was_newly_created):
                self.import_data(crate.destination, *POI_LAYER_INFOS[crate.destination_name])

        #: process trails data
        if any([self.data_was_changed(crate) or poi_was_newly_created for crate in self.get_crates() if crate.destination_name in TRAILS_DATA]):
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
        arcpy.conversion.FeaturesToJSON(self.poi, self.poi_json, geoJSON='GEOJSON')

    def remove_previous_poi_data(self, poi_type):
        with arcpy.da.UpdateCursor(self.poi, [fldID], '{} = \'{}\''.format(fldType, poi_type)) as delete_cursor:
            for row in delete_cursor:
                delete_cursor.deleteRow()

    def data_was_changed(self, crate):
        return crate.result[0] in [Crate.CREATED, Crate.UPDATED, Crate.WARNING]

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
