# Folders

There are 4 folders in this directory.

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
  - This also can include creating new entities based on relationships, eg. creating regional locales from base locales.
- compute
  - This contains code that generates new data based on existing data.
  - For example, computing population statistics for territories based on the populations of their child territories.
- context
  - This provides data for other components to use, eg. `const { locales } = useDataContext();`

# Loading Procedure

From this, we can see the steps involved in loading the data:

1. Core Data
   1. Load main entities: languages, locales, territories, writing systems.
   2. Load extra entities: ISO data, IANA data, ISO retirements.
   3. Connect entities: link languages to parents, connect locales, connect territories to parents, connect writing systems.
   4. Create regional locales.
   5. Compute descendent populations for languages.
2. Provide
   1. Package the loaded data into a `DataContext` for use in the application.
3. Supplemental Data
   1. Load census data.
   2. Load country coordinates.
   3. Load land area data.
   4. Load territory GDP and literacy data.
   5. Load CLDR coverage data.
   6. Load and apply Wikipedia data.
   7. Connect census data to languages and locales.
   8. Compute locale populations from census data.
   9. Compute locale writing populations.
   10. Compute contained territory statistics.
