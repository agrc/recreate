import { buildOutAndBack } from '../DetailsBase';


it('buildOutAndBack builds the appropriate geojson', () => {
  const geojson = {
    geometry: {
      type: 'LineString',
      coordinates: [
        [-111.55855, 40.6164],
        [-111.55709, 40.61642],
        [-111.55589, 40.61674],
        [-111.55464, 40.61678]
      ]
    }
  };
  const expected = [
    [-111.55855, 40.6164],
    [-111.55709, 40.61642],
    [-111.55589, 40.61674],
    [-111.55464, 40.61678],
    [-111.55589, 40.61674],
    [-111.55709, 40.61642],
    [-111.55855, 40.6164]
  ];

  expect(buildOutAndBack(geojson).geometry.coordinates).toEqual(expected);
});
