"""Builds public/data/naturalearth/countries.geojson from Natural Earth's 1:50m map units.

Usage: python3 scripts/map/build_countries.py ne_50m_admin_0_map_units.geojson countries.geojson
"""

import json
import sys
from collections import defaultdict

import shapely
from shapely.geometry import mapping, shape
from shapely.ops import unary_union

# Map units without an ISO code of their own, and which territory they are drawn as.
ISO_OVERRIDES = {'Somaliland': 'SO', 'N. Cyprus': 'CY', 'Siachen Glacier': ''}


def rounded(geometry):
    return json.loads(json.dumps(mapping(geometry)), parse_float=lambda value: round(float(value), 3))


def main(source_path, output_path):
    with open(source_path) as source_file:
        source = json.load(source_file)

    shapes_by_iso = defaultdict(list)
    for feature in source['features']:
        properties = feature['properties']
        iso_code = ISO_OVERRIDES.get(properties['NAME'], properties['ISO_A2_EH'])
        shapes_by_iso[iso_code].append(shape(feature['geometry']).buffer(0))

    iso_codes = sorted(shapes_by_iso)
    merged = [unary_union(shapes_by_iso[iso_code]) for iso_code in iso_codes]
    # Simplifying the countries as one coverage keeps shared borders lined up.
    simplified = shapely.set_precision(shapely.coverage_simplify(merged, tolerance=0.03), 0.001)

    features = [
        {'type': 'Feature', 'properties': {'iso': iso_code}, 'geometry': rounded(geometry)}
        for iso_code, geometry in zip(iso_codes, simplified)
        if not geometry.is_empty
    ]
    with open(output_path, 'w') as output_file:
        json.dump({'type': 'FeatureCollection', 'features': features}, output_file, separators=(',', ':'))
    print(len(features), 'features')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
