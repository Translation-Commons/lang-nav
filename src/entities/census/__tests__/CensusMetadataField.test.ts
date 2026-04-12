import { describe, expect, it } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';

import { CensusMetadataField } from '../CensusMetadataField';
import { CensusCollectorType, CensusData, CensusLanguageUse } from '../CensusTypes';
import { parseCensusMetadata } from '../parseCensusMetadata';

describe('CensusMetadataField', () => {
  const censusInput: string = `#codeDisplay		ca1999	#explanation
#nameDisplay		Canada 1999	Human-readable name for the census, eg. "Canada 2021 Census"
#isoRegionCode	CA		ISO 3166-1 alpha-2 code for the country or region, eg. CA for Canada, US for United States
#yearCollected		1999	The year the census data was collected, eg. 2021, 2016
### Language Criteria ###			
#languageUse		Speaks	The kind of language data collected, eg. Speaks, Writes, Understands
#proficiency		Fluent	The proficiency level of the language data, eg. Conversant or Learning, Fluent, Non-Fluent
#acquisitionOrder		L1	The order in which the language was acquired, eg. Any, L1, L2, L3
#domain		Home	The domain in which the language is used, eg. Any, Home, School, Work, Community, Unspecified
### Population Surveyed ###			
#population	32,000,000		The total number of qualified individuals
#populationSource	https://example.com/population-source		The URL specifically for the population source
#populationSurveyed	3,200,000		The number of individuals surveyed (if different from eligible)
#populationWithPositiveResponses	3,000,000		The number of individuals who gave a response about their language
#sampleRate	0.1		eg. .1, .25, 1 (for 10%, 25%, 100%)
#responsesPerIndividual	1+		eg. 1, 1+, 2+
### Data Constraints ###			
#languagesIncluded	All		eg. All, Indigenous, Official
#geographicScope	Whole Country		eg. Whole Country, Mainland, Territories
#age	5+		eg. 0+, 4+
#gender	Any		Any, Male, Female
#nationality	Citizens		eg. Citizens, Residents, Visitors
#residenceBasis	de jure		eg. de jure (people located by their usual residence), de facto (people located immediately, including visitors)
#quantity	percent		Whether the data is given as a count of people (e.g., 1000) or a percentage of the overall population (e.g., 50%)
#notes	Test object		Any additional notes about the census
### Creator ###			
#collectorType	Government		Type of organization (e.g., Government, CLDR)
#collectorName	Statistics Canada		Name of the organization or journal presenting the data
#collectorNameShort	StatCan		A shorter name of the organization for compact displays, eg. Federal State Statistics Service -> Rosstat
#author	John Doe		Name of the individual author(s) if applicable
#presentedBy	Wikipedia		The secondary source sharing the data, if the listed source document is not from the original collector (e.g. data.un.org, Wikipedia)
### Source Document ###			
#url	https://en.wikipedia.org/wiki/Languages_of_Canada		Most important to have, so people can find the original data
#datePublished	2014-01-15		
#dateAccessed	2025-12-19		
#documentName	Official Languages of Canada		
#tableName	Table 3a: The Languages people Speak in Canada		
#columnName	Mothertongue		
#citation	Example Citation		The full citation, may be redundant if other fields are filled in`;
  const fullMockedCensus: CensusData = {
    type: ObjectType.Census,
    ID: 'ca1999',
    codeDisplay: 'ca1999',
    nameDisplay: 'Canada 1999',
    names: [
      'Canada 1999',
      'Official Languages of Canada',
      'Table 3a: The Languages people Speak in Canada',
    ],
    isoRegionCode: 'CA',
    yearCollected: 1999, // eg. 2021, 2013

    // Kind of language data collected
    languageUse: CensusLanguageUse.Speaks, // eg. Speaks, Writes, Understands
    proficiency: 'Fluent', // eg. Conversant or Learning, Fluent, Non-Fluent
    acquisitionOrder: 'L1', // eg. Any, L1, L2, L3
    domain: 'Home', // eg. Any, Home, School, Work, Community, Unspecified

    // Population
    population: 32_000_000, // The total number of qualified individuals
    populationSource: 'https://example.com/population-source', // The URL specifically for the population source
    populationSurveyed: 3_200_000, // The number of individuals surveyed (if different from eligible)
    populationWithPositiveResponses: 3_000_000, // The number of individuals who gave a response about their language
    sampleRate: 0.1, // eg. .1, .25, 1 (for 10%, 25%, 100%)
    responsesPerIndividual: '1+', // eg. 1, 1+, 2+

    // Data constraints
    languagesIncluded: 'All', // eg. All, Indigenous, Official
    geographicScope: 'Whole Country', // eg. Whole Country, Mainland, Territories
    age: '5+', // eg. 0+, 4+,
    gender: 'Any', // Any, Male, Female
    nationality: 'Citizens', // eg. Citizens, Residents, Visitors
    residenceBasis: 'de jure', // eg. de jure (people located by their usual residence), de facto (people located immediately, including visitors)
    quantity: 'percent', // Whether the data is given as a count of people (e.g., 1000) or a percentage of the overall population (e.g., 50%)
    notes: 'Test object', // Any additional notes about the census

    // Author
    collectorType: CensusCollectorType.Government, // Type of organization (e.g., Government, CLDR)
    collectorName: 'Statistics Canada', // Name of the organization or journal presenting the data
    collectorNameShort: 'StatCan', // A shorter name of the organization for compact displays, eg. Federal State Statistics Service -> Rosstat
    author: 'John Doe', // Name of the individual author(s) if applicable
    presentedBy: 'Wikipedia', // The secondary source sharing the data, if the listed source document is not from the original collector (e.g. data.un.org, Wikipedia)

    // Source
    url: 'https://en.wikipedia.org/wiki/Languages_of_Canada', // Most important to have, so people can find the original data
    datePublished: new Date('2014-01-15'),
    dateAccessed: new Date('2025-12-19'),
    documentName: 'Official Languages of Canada',
    tableName: 'Table 3a: The Languages people Speak in Canada',
    columnName: 'Mothertongue',
    citation: 'Example Citation', // The full citation, may be redundant if other fields are filled in

    // Some fields derived as the data is imported
    languageCount: 2, // Number of languages in this collection
    languageEstimates: { en: 0.8, fr: 0.1 }, // Language code to population estimate mapping

    // Connections to other objects loaded after the fact
    // territory: undefined,
  };

  it('metadataFields should include most fields from CensusData', () => {
    // This test ensures that all fields in CensusData are included in CensusMetadataField
    const censusDataFields = Object.keys(fullMockedCensus) as (keyof CensusData)[];
    const metadataFields = Object.values(CensusMetadataField);

    metadataFields.forEach((field) => {
      expect(censusDataFields).toContain(field);
    });
  });

  it('parseCensusMetadata should correctly parse census metadata from a TSV input', () => {
    const { censuses, warnings } = parseCensusMetadata(censusInput.split('\n'), 'test');
    const trimmedMockedCensus = fullMockedCensus;
    trimmedMockedCensus.languageCount = 0; // Not part of the metadata and is calculated later, so set it to 0 for the comparison
    trimmedMockedCensus.languageEstimates = {}; // Same

    expect(warnings).toEqual([]);
    expect(censuses.length).toBe(1);
    expect(censuses[0]).toEqual(trimmedMockedCensus);
  });
});
