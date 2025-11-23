There are 5 folders in this directory.

They are:
- load
  - This handles loading data from TSV/CSV/JSON files into memory.
  - entities
    - This contains code for loading specific entity types, eg. languages, countries, etc.
  - extra_entities
    - This contains code for loading supplementary data that enhances the main entities, eg. ISO retirements.
  - supplemental
    - This contains code for loading extra data that isn't necessary in the first load
- connect
  - Files in this directory help to fill in the relationships between different data entities.
  - Entities usually start with codes (eg. locale (tpi_PG) has the language tpi) and this file establishes a symbol link between the locale and the language entity.
- generate
- population
  - This handles calculations and updates related to population data.
- context
  - This provides data for other components to use, eg. `const { locales } = useDataContext();`