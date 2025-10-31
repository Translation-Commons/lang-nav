import { addCensusData } from '@features/data-loading/CensusData';
import { DataContextType } from '@features/data-loading/context/useDataContext';
import { CoreDataArrays } from '@features/data-loading/CoreData';
import {
  computeOtherPopulationStatistics,
  connectLanguagesToParent,
  connectLocales,
  connectWritingSystems,
} from '@features/data-loading/DataAssociations';
import { connectVariantTags } from '@features/data-loading/IANAData';
import { computeLocalePopulationFromCensuses } from '@features/data-loading/population/computeLocalePopulationFromCensuses';
import { computeLocaleWritingPopulation } from '@features/data-loading/population/computeLocaleWritingPopulation';
import { updateObjectCodesNameAndPopulation } from '@features/data-loading/population/updateObjectCodesNameAndPopulation';
import {
  computeContainedTerritoryStats,
  connectTerritoriesToParent,
  createRegionalLocales,
} from '@features/data-loading/TerritoryData';
import { LocaleSeparator, ObjectType } from '@features/page-params/PageParamTypes';

import { CensusCollectorType, CensusData } from '@entities/census/CensusTypes';
import {
  getBaseLanguageData,
  getEmptyLanguageSourceSpecificData,
  LanguageData,
  LanguageSource,
} from '@entities/language/LanguageTypes';
import {
  LocaleData,
  LocaleSource,
  ObjectDictionary,
  TerritoryData,
  TerritoryScope,
  VariantTagData,
  WritingSystemData,
  WritingSystemScope,
} from '@entities/types/DataTypes';

export function getDisconnectedMockedObjects(): ObjectDictionary {
  // Languages
  const sjn: LanguageData = {
    ...getBaseLanguageData('sjn', 'Sindarin'), // sjn
    nameEndonym: 'sɪndarɪn', // using IPA because Tengwar letters aren't usually supported
    names: ['Sindarin', 'sɪndarɪn', '', 'Elvish', 'Elven Tongue', 'Edhellen'],
    populationEstimate: 14400,
    populationCited: 24000,
  };
  const dori0123: LanguageData = {
    ...getBaseLanguageData('dori0123', 'Doriathrin'), // dori0123
    nameEndonym: 'dorjaθɪn', // using IPA because Tengwar letters aren't usually supported
    names: ['Central Sindarin', 'Doriathrin', '', 'dorjaθɪn'],
    populationEstimate: 2500,
    populationCited: 2500,
    sourceSpecific: {
      ...getEmptyLanguageSourceSpecificData(),
      All: { childLanguages: [], parentLanguageCode: 'sjn' },
    },
  };

  // Territories
  const BE: TerritoryData = {
    type: ObjectType.Territory,
    ID: 'BE',
    codeDisplay: 'BE',
    nameDisplay: 'Beleriand',
    nameEndonym: 'beˈlerjand',
    names: ['Beleriand', 'beˈlerjand'],
    population: 12000,
    populationFromUN: 12000,
    literacyPercent: 90.0,
    scope: TerritoryScope.Country,
    containedUNRegionCode: '123',
  };
  const ER: TerritoryData = {
    type: ObjectType.Territory,
    ID: 'ER',
    codeDisplay: 'ER',
    nameDisplay: 'Eriador',
    nameEndonym: 'erjador',
    names: ['Eriador', 'The Lone-lands'],
    population: 2400,
    populationFromUN: 2400,
    literacyPercent: 95.0,
    scope: TerritoryScope.Country,
    containedUNRegionCode: '123',
  };
  const HA: TerritoryData = {
    type: ObjectType.Territory,
    ID: 'HA',
    codeDisplay: 'HA',
    nameDisplay: 'Harad',
    nameEndonym: 'ha-rad',
    names: ['Harad', 'Haradwaith', 'Hyarmen', 'the Sunlands', 'ha-rad'],
    population: 15600,
    populationFromUN: 15600,
    literacyPercent: 99.0,
    scope: TerritoryScope.Country,
    containedUNRegionCode: '123',
  };
  const middleEarth: TerritoryData = {
    type: ObjectType.Territory,
    ID: '123',
    codeDisplay: '123',
    nameDisplay: 'Middle Earth',
    nameEndonym: 'endor',
    names: ['Middle Earth', 'Ennorath', 'Endor'],
    scope: TerritoryScope.Continent,
    population: 30000, // will be recomputed later
    populationFromUN: 30000, // This is a gross underestimate, just here to keep the numbers smaller so its easier to read
    containedUNRegionCode: '001',
  };
  const AM: TerritoryData = {
    // The lands west of Middle-earth
    type: ObjectType.Territory,
    ID: 'AM',
    codeDisplay: 'Aman',
    nameDisplay: 'Aman',
    nameEndonym: 'aman',
    names: ['Aman', 'The Undying Lands', 'aman'],
    scope: TerritoryScope.Country, // not really a country, but for our purposes here we need to treat it as one
    population: 20000,
    populationFromUN: 20000,
    literacyPercent: 98.0,
    containedUNRegionCode: '001',
  };
  const world: TerritoryData = {
    type: ObjectType.Territory,
    ID: '001',
    codeDisplay: '001',
    nameDisplay: 'Arda',
    nameEndonym: 'arda',
    names: ['Arda', 'World', 'Aþāraphelūn', 'Ardhon'],
    scope: TerritoryScope.World,
    population: 50000,
    populationFromUN: 50000,
  };

  // Censuses
  const be0590: CensusData = {
    type: ObjectType.Census,
    ID: 'be0590',
    codeDisplay: 'be0590',
    nameDisplay: 'Beleriand YS 590 Census',
    names: ['Beleriand YS 590 Census', 'Recensământul din România 590'],
    yearCollected: 2000,
    collectorType: CensusCollectorType.Government,
    collectorName: 'National Institute of Statistics',
    url: 'https://en.wikipedia.org/wiki/Beleriand#Languages', // not a real part of the article
    isoRegionCode: 'BE',
    eligiblePopulation: BE.population,
    languageEstimates: {
      sjn: 9300, // 77.5%, increased to test out the population recomputation
    },
    languageCount: 1,
  };

  // Locales
  const sjn_BE: LocaleData = {
    type: ObjectType.Locale,
    ID: 'sjn_BE',
    codeDisplay: 'sjn-BE',
    nameDisplay: 'Sindarin (Beleriand)',
    names: ['Sindarin (Beleriand)'],
    populationSpeaking: 9000,
    populationSpeakingPercent: 75,
    localeSource: LocaleSource.StableDatabase,
    languageCode: 'sjn',
    territoryCode: 'BE',
    populationCensus: be0590, // Manually linked because otherwise its done in supplemental data
  };
  const sjn_ER: LocaleData = {
    type: ObjectType.Locale,
    ID: 'sjn_ER',
    codeDisplay: 'sjn-ER',
    nameDisplay: 'Sindarin (Eriador)',
    names: ['Sindarin (Eriador)'],
    populationSpeaking: 1920,
    populationSpeakingPercent: 80,
    localeSource: LocaleSource.StableDatabase,
    languageCode: 'sjn',
    territoryCode: 'ER',
  };
  const dori0123_ER: LocaleData = {
    type: ObjectType.Locale,
    ID: 'dori0123_ER',
    codeDisplay: 'dori0123-ER',
    nameDisplay: 'Doriathrin (Eriador)',
    names: ['Doriathrin (Eriador)'],
    populationSpeaking: 1800,
    populationSpeakingPercent: 75,
    localeSource: LocaleSource.StableDatabase,
    languageCode: 'dori0123',
    territoryCode: 'ER',
  };

  // Writing Systems
  const Teng: WritingSystemData = {
    type: ObjectType.WritingSystem,
    scope: WritingSystemScope.IndividualScript,
    ID: 'Teng', // A real language code!
    codeDisplay: 'Teng',
    nameDisplay: 'Tengwar',
    nameEndonym: 'tîw', // Using IPA because Tengwar letters aren't usually supported
    names: ['Tengwar', 'Fëanorian alphabet'],
  };
  const sjn_Teng_BE: LocaleData = {
    type: ObjectType.Locale,
    ID: 'sjn_Teng_BE',
    codeDisplay: 'sjn-Teng-BE',
    nameDisplay: 'Sindarin (Tengwar, Beleriand)',
    names: ['Sindarin (Tengwar, Beleriand)'],
    localeSource: LocaleSource.StableDatabase,
    populationSpeaking: sjn_BE.populationSpeaking,
    populationSpeakingPercent: sjn_BE.populationSpeakingPercent,
    languageCode: 'sjn',
    territoryCode: 'BE',
    scriptCode: 'Teng',
  };

  // Variant Tags
  const tolkorth: VariantTagData = {
    type: ObjectType.VariantTag,
    ID: 'tolkorth',
    codeDisplay: 'tolkorth',
    nameDisplay: 'Tolkienian Transcribed Orthography',
    names: ['Tolkienian Transcribed Orthography'],
    description:
      'The “Tolkienian” style (academic): ch, lh, rh, th as opposed to Simplified or fan-standard forms: kh, hl, hr, s',
    languageCodes: ['sjn', 'qya'], // qya is Quenya, not in this data set
    localeCodes: ['sjn_Latn', 'qya_Latn'],
    prefixes: ['syn-Latn', 'qya-Latn'],
    languages: [],
    locales: [],
    dateAdded: new Date('2020-01-01'),
  };

  return {
    // Languages
    sjn,
    dori0123,

    // Territories
    BE,
    ER,
    HA,
    '123': middleEarth,
    AM,
    '001': world,

    // Censuses
    be0590,

    // Locales
    sjn_BE,
    sjn_ER,
    dori0123_ER,

    // Writing Systems and their locales
    Teng,
    sjn_Teng_BE,

    // Variant Tags
    tolkorth,
  };
}

export function getMockedCoreData(inputObjects?: ObjectDictionary): CoreDataArrays {
  const objects = inputObjects ?? getDisconnectedMockedObjects();
  const objectArray = Object.values(objects);
  return {
    allLanguoids: objectArray.filter((obj) => obj.type === ObjectType.Language),
    locales: objectArray.filter((obj) => obj.type === ObjectType.Locale),
    territories: objectArray.filter((obj) => obj.type === ObjectType.Territory),
    writingSystems: objectArray.filter((obj) => obj.type === ObjectType.WritingSystem),
    variantTags: objectArray.filter((obj) => obj.type === ObjectType.VariantTag),
    censuses: { be0590: objects.be0590 as CensusData },
  };
}

export function getMockedObjectDictionaries(inputObjects?: ObjectDictionary): {
  objects: ObjectDictionary;
  censuses: Record<string, CensusData>;
  languagesBySource: Record<LanguageSource, Record<string, LanguageData>>;
  languages: Record<string, LanguageData>;
  locales: Record<string, LocaleData>;
  territories: Record<string, TerritoryData>;
  writingSystems: Record<string, WritingSystemData>;
  variantTags: Record<string, VariantTagData>;
} {
  const objects = inputObjects ?? getDisconnectedMockedObjects();
  const objectsArray = Object.values(objects);
  const languagesBySource: Record<LanguageSource, Record<string, LanguageData>> = {
    All: {
      sjn: objects.sjn as LanguageData,
      dori0123: objects.dori0123 as LanguageData,
    },
    BCP: {
      sjn: objects.sjn as LanguageData,
    },
    ISO: {},
    UNESCO: {},
    Glottolog: {},
    CLDR: {},
  };
  const territories: Record<string, TerritoryData> = objectsArray
    .filter((obj) => obj.type === ObjectType.Territory)
    .reduce<Record<string, TerritoryData>>((acc, territory) => {
      acc[territory.ID] = territory;
      return acc;
    }, {});
  const writingSystems: Record<string, WritingSystemData> = objectsArray
    .filter((obj) => obj.type === ObjectType.WritingSystem)
    .reduce<Record<string, WritingSystemData>>((acc, writingSystem) => {
      acc[writingSystem.ID] = writingSystem;
      return acc;
    }, {});
  const locales: Record<string, LocaleData> = objectsArray
    .filter((obj) => obj.type === ObjectType.Locale)
    .reduce<Record<string, LocaleData>>((acc, locale) => {
      acc[locale.ID] = locale;
      return acc;
    }, {});
  const variantTags: Record<string, VariantTagData> = objectsArray
    .filter((obj) => obj.type === ObjectType.VariantTag)
    .reduce<Record<string, VariantTagData>>((acc, variantTag) => {
      acc[variantTag.ID] = variantTag;
      return acc;
    }, {});
  const censuses: Record<string, CensusData> = objectsArray
    .filter((obj) => obj.type === ObjectType.Census)
    .reduce<Record<string, CensusData>>((acc, census) => {
      acc[census.ID] = census;
      return acc;
    }, {});
  return {
    objects,
    censuses,
    languagesBySource,
    languages: languagesBySource.All,
    locales,
    territories,
    writingSystems,
    variantTags,
  };
}

// Makes all of the symbolic connections between the various objects
// Also creates the regional locales, eg. sjn_BE -> sjn_123 & -> sjn_001
export function connectMockedObjects(inputObjects: ObjectDictionary): ObjectDictionary {
  const {
    objects,
    languagesBySource,
    territories,
    writingSystems,
    locales,
    variantTags,
    censuses,
  } = getMockedObjectDictionaries(inputObjects);

  connectLanguagesToParent(languagesBySource);
  connectTerritoriesToParent(territories);
  connectWritingSystems(languagesBySource.All, territories, writingSystems);
  connectLocales(languagesBySource.All, territories, writingSystems, locales);
  connectVariantTags(variantTags, languagesBySource.BCP, locales);
  createRegionalLocales(territories, locales);

  // Update the objects dictionary with the regional locales
  Object.values(locales).forEach((loc) => (objects[loc.ID] = loc));

  // Usually does in the supplemental data load step, we will add censuses connections here
  addCensusData(
    (id) => languagesBySource.All[id],
    (id) => locales[id],
    (id) => territories[id],
    {},
    { censuses: Object.values(censuses), languageNames: {} },
  );

  return objects;
}

/**
 * This function generates a set of data to quickly mock in tests without needing to load in the TSVs.
 *
 * @returns A set of mock objects for testing purposes. These have been processed to connect
 * child objects to eachother and also with attributes computed by the various algorithms.
 */
export function getFullyInstantiatedMockedObjects(
  inputObjects?: ObjectDictionary,
): ObjectDictionary {
  const objects = inputObjects ?? getDisconnectedMockedObjects();

  // Initial connections and algorithms
  connectMockedObjects(objects);
  const { languagesBySource, writingSystems, locales } = getMockedObjectDictionaries(objects);
  computeOtherPopulationStatistics(languagesBySource, writingSystems);

  // From DataContext
  const world = objects['001'] as TerritoryData;
  updateObjectCodesNameAndPopulation(
    [objects.sjn, objects.dori0123] as LanguageData[],
    Object.values(locales),
    world,
    LanguageSource.All,
    LocaleSeparator.Hyphen,
  );

  // From SupplementalData
  computeContainedTerritoryStats(world);

  // Add computed territory locales
  Object.values(locales).forEach((loc) => (objects[loc.ID] = loc));
  computeLocaleWritingPopulation(Object.values(locales));
  computeLocalePopulationFromCensuses(Object.values(locales));
  return objects;
}

export function getMockedDataContext(objects: ObjectDictionary): DataContextType {
  const objectArray = Object.values(objects);
  const languages = objectArray.filter((obj) => obj.type === ObjectType.Language);
  const locales = objectArray.filter((obj) => obj.type === ObjectType.Locale);
  const territories = objectArray.filter((obj) => obj.type === ObjectType.Territory);
  const writingSystems = objectArray.filter((obj) => obj.type === ObjectType.WritingSystem);
  const variantTags = objectArray.filter((obj) => obj.type === ObjectType.VariantTag);
  const censuses = objectArray.reduce(
    (acc, obj) => {
      if (obj.type === ObjectType.Census) acc[obj.ID] = obj;
      return acc;
    },
    {} as Record<string, CensusData>,
  );

  const dataContext: DataContextType = {
    allLanguoids: languages,
    censuses,
    languagesInSelectedSource: languages,
    locales,
    territories,
    writingSystems,
    variantTags,
    getObject: (id: string) => objects[id],
    getLanguage: (id: string) =>
      objects[id]?.type === ObjectType.Language ? objects[id] : undefined,
    getLocale: (id: string) => (objects[id]?.type === ObjectType.Locale ? objects[id] : undefined),
    getTerritory: (id: string) =>
      objects[id]?.type === ObjectType.Territory ? objects[id] : undefined,
    getWritingSystem: (id: string) =>
      objects[id]?.type === ObjectType.WritingSystem ? objects[id] : undefined,
    getVariantTag: (id: string) =>
      objects[id]?.type === ObjectType.VariantTag ? objects[id] : undefined,
  };

  return dataContext;
}
