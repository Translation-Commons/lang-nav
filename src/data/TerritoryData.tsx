import {
  BCP47LocaleCode,
  isTerritoryGroup,
  LocaleData,
  PopulationSourceCategory,
  TerritoryCode,
  TerritoryData,
  TerritoryScope,
} from '../types/DataTypes';
import { ObjectType } from '../types/PageParamTypes';

const DEBUG = false;

export async function loadTerritories(): Promise<Record<TerritoryCode, TerritoryData> | void> {
  return await fetch('data/territories.tsv')
    .then((res) => res.text())
    .then((text) => {
      const territories = text.split('\n').slice(1).map(parseTerritoryLine);
      return territories.reduce<Record<TerritoryCode, TerritoryData>>(
        (territoriesByCode, territory) => {
          territoriesByCode[territory.ID] = territory;
          return territoriesByCode;
        },
        {},
      );
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

export function parseTerritoryLine(line: string): TerritoryData {
  const parts = line.split('\t');
  return {
    type: ObjectType.Territory,

    ID: parts[0],
    codeDisplay: parts[0],
    nameDisplay: parts[1],
    names: [parts[1]],
    scope: parts[2] as TerritoryScope,
    population: Number.parseInt(parts[3].replace(/,/g, '')),
    containedUNRegionCode: parts[4],
    sovereignCode: parts[5],

    // Reference to other objects, filled in with DataAssociations methods
    parentUNRegion: undefined,
    containsTerritories: [],
    sovereign: undefined,
    dependentTerritories: [],
    locales: [],
    censuses: [],
  };
}

export function connectTerritoriesToParent(
  territoriesByCode: Record<TerritoryCode, TerritoryData>,
): void {
  Object.values(territoriesByCode).forEach((territory) => {
    // Connect UN regions
    if (territory.containedUNRegionCode != '') {
      const containedUNRegion = territoriesByCode[territory.containedUNRegionCode];
      if (containedUNRegion != null) {
        containedUNRegion.containsTerritories.push(territory);
        territory.parentUNRegion = containedUNRegion;
      }
    }
    // Connect dependencies to sovereigns
    if (territory.sovereignCode != '') {
      const sovereign = territoriesByCode[territory.sovereignCode];
      if (sovereign != null) {
        sovereign.dependentTerritories.push(territory);
        territory.sovereign = sovereign;
      }
    }
  });
}

/**
 * Locale input data is contained to countries and dependencies -- this adds up data from
 * the smaller territories to create regional locales.
 */
export function createRegionalLocales(
  territories: Record<TerritoryCode, TerritoryData>,
  locales: Record<BCP47LocaleCode, LocaleData>,
): void {
  // Start with the world and recursively create locales for all territory groups
  createRegionalLocalesForTerritory(territories['001'], locales);
}

function createRegionalLocalesForTerritory(
  territory: TerritoryData,
  allLocales: Record<BCP47LocaleCode, LocaleData>,
): void {
  // Make sure that territories within are processed first
  const { containsTerritories } = territory;
  containsTerritories.forEach((t) => createRegionalLocalesForTerritory(t, allLocales));

  if (!isTerritoryGroup(territory.scope)) {
    return; // Only going this for regions/continents
  }

  const territoryLocales = containsTerritories.reduce<Record<BCP47LocaleCode, LocaleData>>(
    (locs, childTerritory) => {
      childTerritory.locales.forEach((loc) => {
        const newLocaleCode = [
          loc.languageCode,
          loc.explicitScriptCode,
          territory.ID,
          loc.variantTags,
        ]
          .filter(Boolean)
          .join('_');
        const newLocale = locs[newLocaleCode];
        if (newLocale == null) {
          // It isn't found yet, create it
          locs[newLocaleCode] = {
            ...loc, // Inherit most properties (codes, population...)

            // But we need to set a new locale code and territory code
            ID: newLocaleCode,
            codeDisplay: newLocaleCode,
            territoryCode: territory.ID,
            territory,

            // Update the population
            populationSpeaking: loc.populationSpeaking || 0,
            populationSpeakingPercent: (loc.populationSpeaking * 100) / territory.population,
            populationSource: PopulationSourceCategory.Aggregated,

            // Clear attributes that cannot be easily aggregated
            nameEndonym: undefined,
            officialStatus: undefined,
            populationCensus: undefined, // No census for this aggregated locale
            censusRecords: [], // No census records for this aggregated locale
            containedLocales: [loc], // Keep track of the original locales that were aggregated
          };
        } else {
          newLocale.populationSpeaking += loc.populationSpeaking || 0;
          newLocale.populationSpeakingPercent =
            (newLocale.populationSpeaking * 100) / territory.population;
          newLocale.containedLocales = [...(newLocale.containedLocales || []), loc];
        }
      });
      return locs;
    },
    {},
  );

  // Save it to the territory
  territory.locales = Object.values(territoryLocales)
    .filter((loc) => loc.populationSpeaking > 10) // Avoid creating too many locale objects
    .sort((a, b) => b.populationSpeaking - a.populationSpeaking);
  territory.locales.forEach((loc) => (allLocales[loc.ID] = loc));
  // At the moment its not being saved to the master locale list
  // Also this should be done after locales are matched to languages
  // -- so these regional locales are not added to the language's locale list
}

export async function loadTerritoryGDPLiteracy(
  territories: Record<TerritoryCode, TerritoryData>,
): Promise<void> {
  return await fetch('data/territories_gdp_literacy.tsv')
    .then((res) => res.text())
    .then((text) => {
      const SKIP_HEADER_ROWS = 5;
      const newTerritoriesData = text
        .split('\n')
        .slice(SKIP_HEADER_ROWS)
        .map((line) => {
          const parts = line.split('\t');
          return { code: parts[0], gdp: parseInt(parts[1]), literacyPercent: parseFloat(parts[2]) };
        });
      newTerritoriesData.forEach((newTerrData) => {
        const territory = territories[newTerrData.code];
        if (territory == null) {
          // Known exclusive: Antarctica (AQ) intentionally left out because its poorly defined linguistically
          if (DEBUG) console.log('Loading new territory data. Territory not found', newTerrData);
          return;
        }
        territory.literacyPercent = newTerrData.literacyPercent;
        territory.gdp = newTerrData.gdp;
      });
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

export function computeContainedTerritoryStats(terr: TerritoryData): void {
  // Make sure that territories within are computed
  const { containsTerritories } = terr;
  containsTerritories.forEach(computeContainedTerritoryStats);

  // Recompute the population for territory groups, in case it was updated from other data
  if (isTerritoryGroup(terr.scope)) {
    terr.population = containsTerritories.reduce((sum, t) => sum + (t.population ?? 0), 0);
  }

  // GDP is easy, just add it up
  terr.gdp ??= containsTerritories.reduce((sum, t) => sum + (t.gdp ?? 0), 0);

  // For literacy we will combine proportional to the population
  terr.literacyPercent ??=
    containsTerritories.reduce(
      (sum, t) => sum + (t.literacyPercent ?? 0) * (t.population ?? 0),
      0,
    ) / terr.population;
}
