## Sources

- `map_world.svg`
  - Original file: <https://upload.wikimedia.org/wikipedia/commons/0/0d/WorldMap.svg>
- `map_countries.svg`
  - Original file: <https://upload.wikimedia.org/wikipedia/commons/5/5e/BlankMap-World-Sovereign_Nations.svg>
  - with many edits to make sure every polygon/group has a corresponding ISO 3166-1 alpha-2 code as ID
  - removed stroke width to avoid rough edges when rendering so many polygons and removed some attributes/styles that are not needed
  - added a global transform to make this Robinson projection match the robinson projection of the above map better
- `country_land_area.tsv`
  - <https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_area>
  - with some land areas added manually for territories not in the Wikipedia list
