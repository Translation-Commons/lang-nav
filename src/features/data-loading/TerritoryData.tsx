import { LocaleSeparator, ObjectType } from '@features/page-params/PageParamTypes';

import { getLocaleCode } from '@entities/locale/LocaleStrings';
import {
  BCP47LocaleCode,
  isTerritoryGroup,
  LocaleData,
  LocaleSource,
  PopulationSourceCategory,
  TerritoryCode,
  TerritoryData,
  TerritoryScope,
} from '@entities/types/DataTypes';

import { sumBy } from '@shared/lib/setUtils';

const DEBUG = false;

export function parseTerritoryLine(line: string): TerritoryData {
  const parts = line.split('\t');
  const population = parts[3] != '' ? Number.parseInt(parts[3].replace(/,/g, '')) : 0;

  return {
    type: ObjectType.Territory,

    ID: parts[0],
    codeDisplay: parts[0],
    nameDisplay: parts[1],
    names: [parts[1]],
    scope: parts[2] as TerritoryScope,
    population, // This may be recomputed later
    populationFromUN: population,
    containedUNRegionCode: parts[4] || undefined,
    sovereignCode: parts[5] || undefined,
  };
}

export function connectTerritoriesToParent(
  territoriesByCode: Record<TerritoryCode, TerritoryData>,
): void {
  Object.values(territoriesByCode).forEach((territory) => {
    // Connect UN regions
    if (territory.containedUNRegionCode) {
      const containedUNRegion = territoriesByCode[territory.containedUNRegionCode];
      if (containedUNRegion != null) {
        if (!containedUNRegion.containsTerritories) {
          containedUNRegion.containsTerritories = [];
        }
        containedUNRegion.containsTerritories.push(territory);
        territory.parentUNRegion = containedUNRegion;
      }
    }
    // Connect dependencies to sovereigns
    if (territory.sovereignCode) {
      const sovereign = territoriesByCode[territory.sovereignCode];
      if (sovereign != null) {
        if (!sovereign.dependentTerritories) {
          sovereign.dependentTerritories = [];
        }
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
  if (!territory) return;

  // Make sure that territories within are processed first
  const containsTerritories = territory.containsTerritories ?? [];
  containsTerritories?.forEach((t) => createRegionalLocalesForTerritory(t, allLocales));

  if (!isTerritoryGroup(territory.scope)) {
    return; // Only going this for regions/continents
  }

  const territoryLocales = containsTerritories?.reduce<Record<BCP47LocaleCode, LocaleData>>(
    (locs, childTerritory) => {
      childTerritory.locales?.forEach((loc) => {
        const newLocaleCode = getLocaleCode(loc, LocaleSeparator.Underscore, territory.ID);
        const newLocale = locs[newLocaleCode];
        if (newLocale == null) {
          // It isn't found yet, create it
          locs[newLocaleCode] = {
            // Set a new locale code and territory code
            type: ObjectType.Locale,
            ID: newLocaleCode,
            codeDisplay: newLocaleCode,
            localeSource: LocaleSource.CreateRegionalLocales,

            // Recognize the new region territory
            territoryCode: territory.ID,
            territory,

            // Add other parts of the locale code
            languageCode: loc.languageCode,
            language: loc.language,
            scriptCode: loc.scriptCode,
            writingSystem: loc.writingSystem,
            variantTagCodes: loc.variantTagCodes != null ? [...loc.variantTagCodes] : [], // dereference the array
            variantTags: loc.variantTags != null ? [...loc.variantTags] : [], // dereference the array

            // Update the population
            populationSpeaking: loc.populationSpeaking,
            populationSpeakingPercent:
              loc.populationSpeaking != null
                ? (loc.populationSpeaking * 100) / territory.population
                : undefined,
            populationSource: PopulationSourceCategory.Aggregated,

            // Add stubs for required fields
            names: [],
            nameDisplay: newLocaleCode, // Will be computed later
            containedLocales: [loc], // Keep track of the original locales that were aggregated
          };
        } else {
          if (loc.populationSpeaking != null) {
            if (newLocale.populationSpeaking == null) newLocale.populationSpeaking = 0;
            newLocale.populationSpeaking += loc.populationSpeaking || 0;
            newLocale.populationSpeakingPercent =
              (newLocale.populationSpeaking * 100) / territory.population;
            newLocale.containedLocales = [...(newLocale.containedLocales || []), loc];
          }
        }
      });
      return locs;
    },
    {},
  );

  // Save it to the territory
  territory.locales = Object.values(territoryLocales ?? {})
    .filter((loc) => (loc.populationSpeaking ?? 0) > 10) // Avoid creating too many locale objects
    .sort((a, b) => (b.populationSpeaking ?? 0) - (a.populationSpeaking ?? 0));

  // Connect locale edges
  territory.locales.forEach((loc) => {
    // Add the new locale to the master list
    allLocales[loc.ID] = loc;
    // Also add the locale to the language's locale list
    if (loc.language) loc.language.locales.push(loc);
  });
}

export async function loadTerritoryGDPLiteracy(
  getTerritory: (id: string) => TerritoryData | undefined,
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
        const territory = getTerritory(newTerrData.code);
        if (territory == null) {
          // Known exclusive: Antarctica (AQ) intentionally left out because its poorly defined linguistically
          if (DEBUG) console.debug('Loading new territory data. Territory not found', newTerrData);
          return;
        }
        territory.literacyPercent = newTerrData.literacyPercent;
        territory.gdp = newTerrData.gdp;
      });
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

export function computeContainedTerritoryStats(terr: TerritoryData | undefined): void {
  if (!terr) return;

  // Make sure that territories within are computed
  const { containsTerritories } = terr;
  containsTerritories?.forEach(computeContainedTerritoryStats);

  // Recompute the population for territory groups, in case it was updated from other data
  if (isTerritoryGroup(terr.scope)) {
    const newPopulation = sumBy(containsTerritories ?? [], (t) => t.population ?? 0);
    if (newPopulation) terr.population = newPopulation;
  }

  // GDP is easy, just add it up
  terr.gdp ??= containsTerritories?.reduce((sum, t) => sum + (t.gdp ?? 0), 0);

  // For literacy we will combine proportional to the population
  terr.literacyPercent ??=
    (containsTerritories?.reduce(
      (sum, t) => sum + (t.literacyPercent ?? 0) * (t.population ?? 0),
      0,
    ) ?? 0) / terr.population;
}

export function loadCountryCoordinates(
  getTerritory: (id: string) => TerritoryData | undefined,
): Promise<void> {
  return fetch('data/country-coord.csv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1)
        .filter((line) => line.trim() !== ''),
    )
    .then((lines) =>
      lines
        .map((line) => {
          // Country,Alpha-2 code,Alpha-3 code,Numeric code,Latitude (average),Longitude (average)
          let parts = line.split(',');
          if (parts.length > 6) {
            // Handle commas in country names
            const extraParts = parts.length - 6;
            const countryParts = parts.slice(0, 1 + extraParts);
            const restParts = parts.slice(1 + extraParts);
            parts = [countryParts.join(','), ...restParts];
          }
          const code = parts[1] as TerritoryCode;
          const codeAlpha3 = parts[2];
          const codeNumeric = parts[3];
          const latitude = parseFloat(parts[4]);
          const longitude = parseFloat(parts[5]);
          if (!isNaN(latitude) && !isNaN(longitude)) {
            return { territoryCode: code, codeAlpha3, codeNumeric, latitude, longitude };
          }
          return undefined;
        })
        .filter((entry) => !!entry),
    )
    .then((coords) =>
      coords.forEach((c) => {
        const terr = getTerritory(c.territoryCode);
        if (terr != null) {
          terr.codeAlpha3 = c.codeAlpha3;
          terr.codeNumeric = c.codeNumeric;
          terr.latitude = c.latitude;
          terr.longitude = c.longitude;
        }
      }),
    )
    .catch((err) => console.error('Error loading CSV:', err));
}

export function loadLandArea(
  getTerritory: (id: string) => TerritoryData | undefined,
): Promise<void> {
  return fetch('data/wiki/country_land_area.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1) // Remove the header row
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) =>
      lines
        .map((line) => {
          const parts = line.split('\t');
          const code = parts[0] as TerritoryCode;
          const landArea = parseFloat(parts[2].replace(/,/g, ''));
          if (!isNaN(landArea)) return { territoryCode: code, landArea };
          return undefined;
        })
        .filter((entry) => !!entry),
    )
    .then((areas) =>
      areas.forEach((a) => {
        const terr = getTerritory(a.territoryCode);
        if (terr != null) terr.landArea = a.landArea;
      }),
    )
    .then(() => {
      // Start at the root and compute all region land areas
      computeRegionLandArea(getTerritory('001')!);
      return;
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

function computeRegionLandArea(territory: TerritoryData): number | undefined {
  if (!isTerritoryGroup(territory.scope)) {
    return territory.landArea;
  }
  const containsTerritories = territory.containsTerritories ?? [];
  const totalLandArea = sumBy(containsTerritories, (t) => computeRegionLandArea(t) ?? 0);
  territory.landArea = totalLandArea;
  return totalLandArea;
}
