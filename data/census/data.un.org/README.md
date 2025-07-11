Data in this folder comes from the United Nations Statistics Division. Most of the data comes from the census of countries, processed by the UN representatives.

URL: [https://data.un.org/Data.aspx?d=POP&f=tableCode:27]()

# Procedure

1. Open the UN website and select filters
   1. Area: Total (at the moment we don't import separate data for urban or rural)
   2. Sex: Both Sexes
   3. Pick a specific country if you want to download only one.
2. Click the download button
   1. If you prefer a TSV, you can download the pipe-separated values and use regex to convert it to TSV.
3. Once you have the data, you need to match Language Names with Language Codes
   1. You can use the Language Navigator itself to find languages.
   2. Use ISO 639-3 codes but you can also use ISO 639-5 codes for language families and glottocodes for dialects or groups without ISO codes.
   3. Use special ISO codes when you cannot find a match:
      - `und` for undetermined languages
      - `mul` for multiple languages eg. "Total" or non-genetic language groupings like "
      - `zxx` for no linguistic content eg. "None"
      - `mis` for miscellaneous languages
      - `` (empty) if you want to leave it unmatched -- maybe to be fixed later when you have more information
   4. If you are combining data from different years of a census and language names change, you can use different rows with the same language code. For instance, in [the Australia census data](au.tsv) there is a row for Filipino for the recent years but Pilipino for older years. They both use the same language code `fil` but since the population data is empty for other years it won't overlap. If there is data for the same language code in the same single census it is added together -- but see if you can use dialect codes instead.
4. The final output files should contain the metadata format as described in [the general census readme](../README.md) file. You can put multiple censuses together in one file as it explains -- but it may be easier to only do one country at a time since the languages will be different and you'll have a lot of empty rows.
