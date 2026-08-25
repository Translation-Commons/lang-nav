import { computeContainedTerritoryStats } from '@features/data/compute/computeTerritoryStats';
import { connectEntitiesAndCreateDerivedData } from '@features/data/compute/connectEntities';
import { updateEntitiesBasedOnDataParams } from '@features/data/compute/updateEntitiesBasedOnDataParams';
import { updatePopulations } from '@features/data/compute/updatePopulations';
import { addCensusData } from '@features/data/connect/connectCensuses';
import LoadingStage from '@features/data/context/LoadingStage';
import { DataContextType } from '@features/data/context/useDataContext';
import { CoreDataArrays } from '@features/data/load/CoreData';
import { EntityType, LocaleSeparator } from '@features/params/PageParamTypes';

import { CensusCollectorType, CensusData } from '@entities/census/CensusTypes';
import { LanguageModality } from '@entities/language/LanguageModality';
import {
  getBaseLanguageData,
  LanguageData,
  LanguageScope,
  LanguageSource,
} from '@entities/language/LanguageTypes';
import { LocaleData, LocaleSource } from '@entities/locale/LocaleTypes';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityDictionary } from '@entities/types/DataTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { WritingSystemData, WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import { toDictionary } from '@shared/lib/setUtils';

export function getDisconnectedMockedEntities(): EntityDictionary {
  // Languages
  const sjn: LanguageData = {
    ...getBaseLanguageData('sjn', 'Sindarin'), // sjn
    nameEndonym: 'sɪndarɪn', // using IPA because Tengwar letters aren't usually supported
    names: ['Sindarin', 'sɪndarɪn', '', 'Elvish', 'Elven Tongue', 'Edhellen'],
    scope: LanguageScope.Language,
    pop: {
      overall: 14400,
      speaking: {},
      writing: {},
      rough: 24000,
    },
    primaryScriptCode: 'Teng',
    modality: LanguageModality.SpokenAndWritten,
    Combined: { parentLanguageCode: 'elv' },
    ISO: { parentLanguageCode: 'elv' },
  };
  const dori0123: LanguageData = {
    ...getBaseLanguageData('dori0123', 'Doriathrin'), // dori0123
    nameEndonym: 'dorjaθɪn', // using IPA because Tengwar letters aren't usually supported
    names: ['Central Sindarin', 'Doriathrin', '', 'dorjaθɪn'],
    scope: LanguageScope.Dialect,
    pop: {
      overall: 2500,
      speaking: {},
      writing: {},
      rough: 2500,
    },
    primaryScriptCode: 'Teng',
    modality: LanguageModality.MostlySpoken,
    Combined: { parentLanguageCode: 'sjn' },
    ISO: { parentLanguageCode: 'sjn' },
  };

  // Territories
  const BE: TerritoryData = {
    type: EntityType.Territory,
    ID: 'BE',
    codeDisplay: 'BE',
    nameDisplay: 'Beleriand',
    nameEndonym: 'beˈlerjand',
    names: ['Beleriand', 'beˈlerjand'],
    literacyPercent: 90.0,
    pop: {
      overall: 12000,
      fromUN: 12000,
      speaking: 12000,
      writing: 10800, // 12000 * 0.9
    },
    scope: TerritoryScope.Country,
    containedUNRegionCode: '123',
  };
  const ER: TerritoryData = {
    type: EntityType.Territory,
    ID: 'ER',
    codeDisplay: 'ER',
    nameDisplay: 'Eriador',
    nameEndonym: 'erjador',
    names: ['Eriador', 'The Lone-lands'],
    literacyPercent: 95.0,
    pop: {
      overall: 2400,
      fromUN: 2400,
      writing: 2400 * 0.95, // 2280
    },
    scope: TerritoryScope.Country,
    containedUNRegionCode: '123',
  };
  const HA: TerritoryData = {
    type: EntityType.Territory,
    ID: 'HA',
    codeDisplay: 'HA',
    nameDisplay: 'Harad',
    nameEndonym: 'ha-rad',
    names: ['Harad', 'Haradwaith', 'Hyarmen', 'the Sunlands', 'ha-rad'],
    literacyPercent: 99.0,
    pop: {
      overall: 15600,
      fromUN: 15600,
      writing: 15444, // 15600 * 0.99
    },
    scope: TerritoryScope.Country,
    containedUNRegionCode: '123',
  };
  const middleEarth: TerritoryData = {
    type: EntityType.Territory,
    ID: '123',
    codeDisplay: '123',
    nameDisplay: 'Middle Earth',
    nameEndonym: 'endor',
    names: ['Middle Earth', 'Ennorath', 'Endor'],
    scope: TerritoryScope.Continent,
    containedUNRegionCode: '001',
    pop: { overall: 30000, fromUN: 30000 },
  };
  const AM: TerritoryData = {
    // The lands west of Middle-earth
    type: EntityType.Territory,
    ID: 'AM',
    codeDisplay: 'Aman',
    nameDisplay: 'Aman',
    nameEndonym: 'aman',
    names: ['Aman', 'The Undying Lands', 'aman'],
    scope: TerritoryScope.Country, // not really a country, but for our purposes here we need to treat it as one
    pop: {
      overall: 20000,
      fromUN: 20000,
      writing: 20000 * 0.98, // 19600
    },
    literacyPercent: 98.0,
    containedUNRegionCode: '001',
  };
  const world: TerritoryData = {
    type: EntityType.Territory,
    ID: '001',
    codeDisplay: '001',
    nameDisplay: 'Arda',
    nameEndonym: 'arda',
    names: ['Arda', 'World', 'Aþāraphelūn', 'Ardhon'],
    scope: TerritoryScope.World,
    pop: { overall: 50000, fromUN: 50000 },
  };

  // Censuses
  const be0590: CensusData = {
    type: EntityType.Census,
    ID: 'be0590',
    codeDisplay: 'be0590',
    nameDisplay: 'Beleriand YS 590 Census',
    names: ['Beleriand YS 590 Census', 'Recensământul din România 590'],
    yearCollected: 2000,
    collectorType: CensusCollectorType.Government,
    collectorName: 'National Institute of Statistics',
    collectorNameShort: 'NIS', // tbd make organization entity for this
    url: 'https://en.wikipedia.org/wiki/Beleriand#Languages', // not a real part of the article
    isoRegionCode: 'BE',
    population: BE.pop.overall, // 12000
    languageEstimates: {
      sjn: 9300, // 77.5%, increased to test out the population recomputation
    },
    languageCount: 1,
  };

  // Locales
  const sjn_BE: LocaleData = {
    type: EntityType.Locale,
    ID: 'sjn_BE',
    codeDisplay: 'sjn-BE',
    nameDisplay: 'Sindarin (Beleriand)',
    names: ['Sindarin (Beleriand)'],
    localeSource: LocaleSource.StableDatabase,
    languageCode: 'sjn',
    territoryCode: 'BE',
    pop: {
      speaking: { unadjusted: 9000, percent: 75, census: be0590 },
      writing: { unadjusted: 8000 },
    },
  };
  const sjn_ER: LocaleData = {
    type: EntityType.Locale,
    ID: 'sjn_ER',
    codeDisplay: 'sjn-ER',
    nameDisplay: 'Sindarin (Eriador)',
    names: ['Sindarin (Eriador)'],
    localeSource: LocaleSource.StableDatabase,
    languageCode: 'sjn',
    territoryCode: 'ER',
    // 1920 is now dropped because there is no census data backing it up
    pop: { speaking: { unadjusted: 1920, percent: 80 }, writing: { unadjusted: 1920 } },
  };
  const dori0123_ER: LocaleData = {
    type: EntityType.Locale,
    ID: 'dori0123_ER',
    codeDisplay: 'dori0123-ER',
    nameDisplay: 'Doriathrin (Eriador)',
    names: ['Doriathrin (Eriador)'],
    localeSource: LocaleSource.StableDatabase,
    languageCode: 'dori0123',
    territoryCode: 'ER',
    pop: { speaking: { unadjusted: 1800, percent: 75 }, writing: { unadjusted: 0 } },
  };

  // Writing Systems
  const Teng: WritingSystemData = {
    type: EntityType.WritingSystem,
    scope: WritingSystemScope.IndividualScript,
    ID: 'Teng', // A real language code!
    codeDisplay: 'Teng',
    nameDisplay: 'Tengwar',
    nameEndonym: 'tîw', // Using IPA because Tengwar letters aren't usually supported
    names: ['Tengwar', 'Fëanorian alphabet'],
  };
  const sjn_Teng_BE: LocaleData = {
    type: EntityType.Locale,
    ID: 'sjn_Teng_BE',
    codeDisplay: 'sjn-Teng-BE',
    nameDisplay: 'Sindarin (Tengwar, Beleriand)',
    names: ['Sindarin (Tengwar, Beleriand)'],
    localeSource: LocaleSource.StableDatabase,
    languageCode: 'sjn',
    territoryCode: 'BE',
    scriptCode: 'Teng',
    pop: {
      speaking: {
        unadjusted: sjn_BE.pop.speaking.unadjusted,
        percent: sjn_BE.pop.speaking.percent,
      },
      writing: {},
    },
  };

  // Variants
  const tolkorth: VariantData = {
    type: EntityType.Variant,
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

    // Variants
    tolkorth,
  };
}

export function getMockedCoreData(inputEnts?: EntityDictionary): CoreDataArrays {
  const ents = inputEnts ?? getDisconnectedMockedEntities();
  const entArray = Object.values(ents);
  return {
    allLanguoids: entArray.filter((ent) => ent.type === EntityType.Language),
    locales: entArray.filter((ent) => ent.type === EntityType.Locale),
    territories: entArray.filter((ent) => ent.type === EntityType.Territory),
    writingSystems: entArray.filter((ent) => ent.type === EntityType.WritingSystem),
    variants: entArray.filter((ent) => ent.type === EntityType.Variant),
    censuses: { be0590: ents.be0590 as CensusData },
    keyboards: entArray.filter((ent) => ent.type === EntityType.Keyboard),
    organizations: entArray.filter((ent) => ent.type === EntityType.Org),
  };
}

export function getMockedEntityDictionaries(inputEnts?: EntityDictionary): {
  ents: EntityDictionary;
  censuses: Record<string, CensusData>;
  languagesBySource: Record<LanguageSource, Record<string, LanguageData>>;
  languages: Record<string, LanguageData>;
  locales: Record<string, LocaleData>;
  territories: Record<string, TerritoryData>;
  writingSystems: Record<string, WritingSystemData>;
  variants: Record<string, VariantData>;
} {
  const ents = inputEnts ?? getDisconnectedMockedEntities();
  const entsArray = Object.values(ents);
  const languagesBySource: Record<LanguageSource, Record<string, LanguageData>> = {
    Combined: toDictionary(
      entsArray.filter((ent) => ent.type === EntityType.Language),
      (ent) => ent.ID,
    ),
    BCP: {
      sjn: ents.sjn as LanguageData,
    },
    ISO: {},
    UNESCO: {},
    Glottolog: {},
    CLDR: {},
  };
  const territories: Record<string, TerritoryData> = entsArray
    .filter((ent) => ent.type === EntityType.Territory)
    .reduce<Record<string, TerritoryData>>((acc, territory) => {
      acc[territory.ID] = territory;
      return acc;
    }, {});
  const writingSystems: Record<string, WritingSystemData> = entsArray
    .filter((ent) => ent.type === EntityType.WritingSystem)
    .reduce<Record<string, WritingSystemData>>((acc, writingSystem) => {
      acc[writingSystem.ID] = writingSystem;
      return acc;
    }, {});
  const locales: Record<string, LocaleData> = entsArray
    .filter((ent) => ent.type === EntityType.Locale)
    .reduce<Record<string, LocaleData>>((acc, locale) => {
      acc[locale.ID] = locale;
      return acc;
    }, {});
  const variants: Record<string, VariantData> = entsArray
    .filter((ent) => ent.type === EntityType.Variant)
    .reduce<Record<string, VariantData>>((acc, variant) => {
      acc[variant.ID] = variant;
      return acc;
    }, {});
  const censuses: Record<string, CensusData> = entsArray
    .filter((ent) => ent.type === EntityType.Census)
    .reduce<Record<string, CensusData>>((acc, census) => {
      acc[census.ID] = census;
      return acc;
    }, {});
  return {
    ents,
    censuses,
    languagesBySource,
    languages: languagesBySource.Combined,
    locales,
    territories,
    writingSystems,
    variants,
  };
}

// Makes all of the symbolic connections between the various entities
// Also creates the aggregated locales, eg. sjn_BE -> sjn_123 & -> sjn_001
export function connectMockedEntities(inputEnts: EntityDictionary): EntityDictionary {
  const { ents, languagesBySource, territories, writingSystems, locales, variants, censuses } =
    getMockedEntityDictionaries(inputEnts);

  connectEntitiesAndCreateDerivedData(
    languagesBySource,
    territories,
    writingSystems,
    locales,
    variants,
    {},
    {},
  );

  // Update the entity dictionary with the aggregated locales
  Object.values(locales).forEach((loc) => (ents[loc.ID] = loc));

  // Usually does in the supplemental data load step, we will add censuses connections here
  addCensusData(
    (id) => languagesBySource.Combined[id],
    (id) => locales[id],
    (id) => territories[id],
    {},
    { censuses: Object.values(censuses), languageNames: {}, warnings: [] },
    [],
  );

  return ents;
}

/**
 * This function generates a set of data to quickly mock in tests without needing to load in the TSVs.
 *
 * @returns A set of mock entities for testing purposes. These have been processed to connect
 * child entities to eachother and also with attributes computed by the various algorithms.
 */
export function getFullyInstantiatedMockedEntities(inputEnts?: EntityDictionary): EntityDictionary {
  const ents = inputEnts ?? getDisconnectedMockedEntities();

  // Initial connections and algorithms
  connectMockedEntities(ents);
  const { languagesBySource, locales } = getMockedEntityDictionaries(ents);

  // From DataContext
  const world = ents['001'] as TerritoryData;
  updateEntitiesBasedOnDataParams(
    Object.values(languagesBySource.Combined) as LanguageData[],
    Object.values(locales),
    world,
    LanguageSource.Combined,
    LocaleSeparator.Hyphen,
  );

  // From SupplementalData
  computeContainedTerritoryStats(world);
  updatePopulations(
    Object.values(languagesBySource.Combined) as LanguageData[],
    Object.values(locales),
    world,
  );
  return ents;
}

export function getMockedDataContext(ents: EntityDictionary): DataContextType {
  const entArray = Object.values(ents);
  const languages = entArray.filter((ent) => ent.type === EntityType.Language);
  const locales = entArray.filter((ent) => ent.type === EntityType.Locale);
  const territories = entArray.filter((ent) => ent.type === EntityType.Territory);
  const writingSystems = entArray.filter((ent) => ent.type === EntityType.WritingSystem);
  const variants = entArray.filter((ent) => ent.type === EntityType.Variant);
  const censuses = entArray.reduce(
    (acc, ent) => {
      if (ent.type === EntityType.Census) acc[ent.ID] = ent;
      return acc;
    },
    {} as Record<string, CensusData>,
  );
  const organizations = entArray.filter((ent) => ent.type === EntityType.Org);

  const dataContext: DataContextType = {
    allLanguoids: languages,
    censuses,
    keyboards: [],
    languagesInSelectedSource: languages,
    loadingStage: LoadingStage.AlgorithmsFinished,
    locales,
    organizations,
    territories,
    writingSystems,
    variants,
    getEntity: (id: string) => ents[id],
    getLanguage: (id: string) => (ents[id]?.type === EntityType.Language ? ents[id] : undefined),
    getCLDRLanguage: (id: string) =>
      Object.values(ents).find(
        (ent) => ent.type === EntityType.Language && (ent as LanguageData).CLDR?.code === id,
      ) as LanguageData | undefined,
    getLocale: (id: string) => (ents[id]?.type === EntityType.Locale ? ents[id] : undefined),
    getTerritory: (id: string) => (ents[id]?.type === EntityType.Territory ? ents[id] : undefined),
    getWritingSystem: (id: string) =>
      ents[id]?.type === EntityType.WritingSystem ? ents[id] : undefined,
    getVariant: (id: string) => (ents[id]?.type === EntityType.Variant ? ents[id] : undefined),
    getOrganization: (id: string) => (ents[id]?.type === EntityType.Org ? ents[id] : undefined),
  };

  return dataContext;
}
