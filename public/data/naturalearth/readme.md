## Sources

- `countries.geojson`
  - Original file: [Natural Earth 1:50m Admin 0 – Map Units](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-details/)
    (public domain), from <https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_map_units.geojson>
  - Each feature keeps one property, `iso`: its ISO 3166-1 alpha-2 code, matching our territory IDs.
    Map units of the same country (e.g. England and Scotland) are merged; overseas regions with
    their own code (e.g. Réunion, Svalbard) stay separate. Somaliland is merged into Somalia and
    Northern Cyprus into Cyprus. Siachen Glacier has an empty code, so it is drawn but not clickable.
  - Simplified so neighbouring borders still line up. Rebuild with
    `python3 scripts/map/build_countries.py ne_50m_admin_0_map_units.geojson countries.geojson`
    (needs `shapely` 2.1+).
