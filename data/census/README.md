# Census Guide

This is a guide to add language data from a census.

## Step 1: Find the census

Look for the appropriate census website directly -- avoid copying information from an intermediary like Wikipedia. For instance, let's take Canada. Their census website is https://www150.statcan.gc.ca/ .

Sometimes a government website is no longer available or it is only available to specific country IPs. In that case you can find the information otherwise using the Internet Archive at https://archive.org/ .

Government websites may or may not be translated into English or another language you understand. If the website is not originally, see if there is an option to change the website's language, otherwise you may need to use a translation service like Google Translate.

## Step 2: Find the proper table

There will be a lot of potential census data. To find data specific to languages, look for "population" statistics or "culture". Once you find a table with information about languages, you may find multiple other ones that are related, such as "mother tongue", "home language", "language spoken at work", etc. You may need to look at multiple tables to get the full picture of the languages used in the country. The first table you find may not be the best. Once you have found good table or tables, write down the following characteristics:
- The name of the table (e.g., "Population by mother tongue")
- The URL for future people to check the data (e.g., https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810000201)
- The date the information is dated to (e.g., "2021")
- The date the information was published (e.g., "2022-02-09")

We also want to understand the precise demographic characteristcs of the people. Try to find as much possible of the following characteristics:
- The modality the language is used in ("spoken", "written", "spoken or written", "understands", "ethnicity") -- ethnicity is not recommended but sometimes it is useful data
- The time learned ("mothertongue", "first language", "second language")
- The level of proficiency ("basic", "intermediate", "fluent")
- The geographic scope of the data (e.g., "whole country", "mainland -- without dependencies")
- The age of the people surveyed (e.g., "all ages", "15 years and older")

## Step 3: Process the census data

While it would be great to just copy-paste the data into a tab-separated-value (tsv) file, it is often not that easy.

**Language Codes**: In particular, most data will list names of languages -- it will be up to you to map those names to the language codes used in this project. You can find the language codes in the [/public/data/languages.tsv](/public/data/languages.tsv) file. Aim to find the best ISO 639-3 code but sometimes there is not a perfect match -- maybe there is a glottocode.

Sometimes a row of data from a census does not have an easy to use language code. For completeness it is good to keep that row but to use a special language code. These rows will be dropped during the import process but will be kept in the file for reference. The following codes are used for these special cases:
* `und` is used for "undetermined" languages - the common case when you don't know. For instance, multiple languages are named "Tonga" -- without additional context clues you may not know which one is meant.
* `mul` is used for "multiple languages" - such as a row that says "Indigenous languages" or "Other Languages" -- however you can use language family codes if the row corresponds to a language family like "Germanic languages".
* `mis` is used for "uncoded languages" like a dialect without an ISO code or glottocode.
* `zxx` is used for "no linguistic content" -- such as "no language" or "none".
 
If you are not sure which one to use, use `und`.

**Inferred Entries**: [Process not finalized] Iterating through the data you may realize there's only a dialect of a popular language listed (eg. High German only, not German generally) or only a language group (eg. Serbo-Croatian). In these cases, it may be important to add an artificial entry for the missing common language -- do that but also add a comment in the file noting that this is an artificial entry and why it was added.

**Language Families**: Some censuses may include language family data in addition to individual languages. For data completeness, it may be useful to include that data as well. You will have to use ISO 639-5 language family codes or glottocodes for these entries. If you need help finding the right code, it can be useful to use the Hierarchy view and use the language family in the search term. The canadian census in this regard is very helpful here since the data comes in a hierarchical form, so you can look up language codes using the tool directly, eg. http://translation-commons.github.io/lang-nav/?view=Hierarchy&searchString=atha&searchBy=English+Name+or+ID

## Step 4: Add the data to the project
Once you have the data, you can add it to the project. The data should be added to the [/public/data/census](/public/data/census) directory. The file should be named in the format `<countryISO><year>.tsv` (e.g., `ca2021.tsv`).

The file should be a tab-separated-value (tsv) file with a header section and then the language data. 

### Header

Before the language data, include a header row with metadata about the census data that you collected in Step 2. Prepend a `#` to each row in the header so it is not interpreted as language data. 

Column 1 is the field name (eg. #acquisitionOrder), Column 2 is shows the value for that field (eg. L1). Columns 3 and onward describe the different census tables/columns that are you are importing. If metadata is the same for every census, then you can just indicate it in column 2. If the metadata is different for different census tables, then you can use columns 3+ to indicate the differences. 

```tsv
#nameDisplay		Canada 2021	Canada 2021 @Home	Canada 2021 L1 Sampled	Canada 2021 L1
#isoRegionCode	CA				
#yearCollected	2021				
#datePublished		2022-08-17	2025-02-19	2024-10-23	2022-08-17
#dateAccessed	2025-05-30				
#acquisitionOrder		Any	Any	L1	L1
```

In order to make table formatting work well on git, make sure each row has the same number of columns (thereby, same number of tabs).

If you are adding data from very different census tables -- like the language groupings are different of the methodology is different -- then you should use a different file for that census data, like we have with `in2011c16.tsv` and `in2011c17.tsv`.

The header should include the following rows:

**Required Rows**
* `nameDisplay`: A short name describing the census / census table (e.g., "Canada 2021 L1")
* `isoRegionCode`: The ISO 3166-1 alpha-2 code of the country (e.g., "CA" for Canada)
* `yearCollected`: The year the data was collected (e.g., "2021")
* `eligiblePopulation`: The total population of the country or region the data is from (e.g., "36,328,480" for Canada in 2021)
  * If the data is from a subset of the population (eg. only people over 15 years old) then this number should be the total population of that subset, not the whole country.
* `collectorType`: The type of individual or group that collected the data (e.g., "Government", "NGO", "Academic")

**Recommended Rows**
More is better, but also if you don't have a value, leave it empty. For instance, if a census does not specifically indicate its about spoken language, don't set the modality. Nonetheless the more data you can provide the more the data can be trusted and used.
* **Language criteria**, why would a person be counted for a language
  * `modality`: The modality of the language (e.g., "spoken", "written", "spoken or written", "understands")
  * `proficiency`: The level of proficiency in the language (e.g., "basic", "intermediate", "fluent")
  * `acquisitionOrder`: The order in which the language was acquired (e.g., "L1" for first language, "L2" for second language, "Any" for any order)
  * `domain`: The domain in which the language is used (e.g., "Home", "Work", "Education", "Any" for any domain)
* **Population surveyed**
  * `geographicScope`: The geographic scope of the data (e.g., "whole country", "mainland -- without dependencies")
  * `age`: The age of the people surveyed (e.g., "0+" for  "all ages", "15+" for 15 years and older)
  * `notes`: Any additional notes about the data
  * `responsesPerIndividual`: The number of responses per individual (e.g., "1+" for one or more responses, "1" if every individual has exactly one response)
    * If the number of responses is 1 then we can add up the data without worrying about double counting.
  * `sampleRate`: The sample rate of the data (e.g., "0.25" the data is interpolated from 25% of the population, "1" for the the data is not interpolated) 
  * `respondingPopulation`: The total number of people who responded to the question about language (eligiblePopulation - the number of people who did not respond to the question)
    * This is useful to compute the expected percentage of how many people speak the language in the country.
* **Source / Citation**
  * `collectorName`: The name of the individual or group that collected the data (e.g., "Statistics Canada")
  * `url`: The URL of the census table (e.g., "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810000201")
  * `tableName`: The name of the original data table (e.g., "Knowledge of languages by age and gender"
  * `columnName`: The name of the column in the table the data is from (e.g., "Total - Single and multiple responses of knowledge of languages")
  * `datePublished`: The date the data was published (e.g., "2022-02-09")
  * `citation`: The citation for the census data (e.g., "Statistics Canada. Table 98-10-0294-01 Knowledge of Indigenous languages by single and multiple knowledge of languages responses and Indigenous language acquisition: Canada, provinces and territories")

### Population Estimates

Now we will be in the main body of the tsv file. 

First have a header row
```tsv
Language Code	Language Name from Source	<table name 1>	<table name 2>	<table name 3>	...
```

- `language_code`: The ISO code of the language (e.g., `eng` for English).
- `language_name`: The name of the language from the census source -- important for bookkeeping in case we learn later it was mis-coded, for example Syilx (Okanagan)
- `population`: The number of people who speak the language. -- you can repeat this column multiple times for different census tables.

If you have multiple population columns, if a language is not listed for the source at that column, leave it empty (do not set it to 0).

#### Example
See this snippet from the Canadian census. You can language codes in ISO and glottolog format. Special code `mul` won't be consumed in the import process but will be left in the file for reference because it was in the census table. Different tables show different data. You can also see why blanks are used when languages were not in all tables.
```tsv
eng	English	31,628,570	26,947,850	21,226,110	27,166,170
fra	French	10,563,235	8,143,045	7,546,925	8,261,800
mul	Non-official languages	10,724,700	8,197,070	8,968,265	8,289,395
mul	Indigenous languages	243,155	180,775	185,510	182,925
algo1256	Algonquian languages	163,815	119,635	123,135	121,275
bla	Blackfoot	6,680	4,970	4,945	4,915
...
afa	Afro-Asiatic languages	1,100,035			858,060
ber	Berber languages	42,835			32,550
kab	Kabyle	37,415			29,000
shi	Tachelhit				110
taq	Tamasheq				75
tzm	Tamazight	4,735			2,950
```

## Step 5: Plug it in

Add the new filename to the file that imports the census data. Find the variable `CENSUS_FILENAMES` in [CensusData.tsx](/src/dataloading/CensusData.tsx) and add the new filename. Test out that the new data is loaded by running the project locally (instructions in the [README](/README.md)).

Check the census table view at your local domain eg. `https://localhost:####/lang-nav/?objectType=Census&view=Table` to make sure your new censuses appear and there are roughly as many languages as you expected. Noting that `mis`/`und`/`mul` languages have already been filtered out.


where `<censusID>` is the name of the file you added without the `.tsv` extension (e.g., `ca2021` for `ca2021.tsv`).

It's recommended to check the details view `<https://localhost:####>`/lang-nav/?view=Details&objectID=`<censusID>` for each census table you added.
Once the file is read in with the others, test it out on your local host and if it looks good, then you submit a pull request to the main project.