import { ObjectType } from '@features/params/PageParamTypes';

import {
  isTerritoryGroup,
  TerritoryData,
  TerritoryScope,
} from '@entities/territory/TerritoryTypes';

import { toDictionary } from '@shared/lib/setUtils';

import { fetchFromApi } from './apiConfig';

/**
 * Loads territories from the API instead of from five separate TSV files.
 *
 * This replaces `territories.tsv`, `territories_gdp_literacy.tsv`,
 * `country-coord.csv`, `country_land_area.tsv` and `territory_names.tsv` with a
 * single request, because the ETL merged all five into the `territory` table
 * and `entity_name`. Five HTTP requests become one.
 *
 * The returned shape is identical to `loadTerritories()`, so `CoreData.tsx`
 * cannot tell the two apart.
 */

/** One `entity_name` row. Territory names are split across three kinds. */
type ApiEntityName = {
  kind: string;
  name: string;
};

/** The embedded `entity` row. Only `name_display` is needed here: the endonym
 *  is read from `territory.name_endonym`, which is the column the ETL fills. */
type ApiEntity = {
  name_display: string;
  entity_name: ApiEntityName[];
};

export type ApiTerritory = {
  id: string;
  code_alpha3: string | null;
  code_numeric: string | null;
  scope: number;
  name_endonym: string | null;
  contained_un_region_id: string | null;
  sovereign_id: string | null;
  population_from_un: number | null;
  literacy_percent: number | null;
  gdp: number | null;
  land_area_km2: number | null;
  latitude: number | null;
  longitude: number | null;
  entity: ApiEntity;
};

// One request, two levels of embedding. entity_name reaches through entity
// because the foreign key runs territory -> entity <- entity_name.
//
// `population` is deliberately NOT selected. It is D3's rolled-up value, and
// the frontend recomputes the same roll-up in computeContainedTerritoryStats.
// What the frontend needs here is the RAW figure, which is population_from_un:
// it feeds pop.fromUN, which getObjectPopulationDirectlySourced surfaces as its
// own field. Sending the roll-up would put a computed number under a label that
// promises a sourced one, and nothing would look wrong.
// entity_name is ordered explicitly. Postgres makes no promise about the order
// of rows without an ORDER BY, so leaving it out would let the names array
// reshuffle between two identical requests - stable in practice until a
// vacuum or a plan change moves the rows, which is the worst kind of unstable.
// Ordering by id gives insertion order, which is the file's order.
const TERRITORY_QUERY =
  '/territory?select=id,code_alpha3,code_numeric,scope,name_endonym,' +
  'contained_un_region_id,sovereign_id,population_from_un,literacy_percent,gdp,' +
  'land_area_km2,latitude,longitude,entity(name_display,entity_name(kind,name))' +
  '&entity.entity_name.order=id.asc&order=id.asc';

export async function loadTerritoriesFromApi(): Promise<Record<string, TerritoryData> | void> {
  // Resolves to undefined on failure, exactly as loadEntitiesFromFile does.
  //
  // This is not defensive tidiness, it is the difference between an error
  // message and a hang. CoreData.tsx awaits every loader in one Promise.all and
  // then checks the results for null, alerting if any is missing. A rejected
  // promise skips that check entirely: the whole Promise.all rejects, the alert
  // never runs, and the app sits on "Loading stage: 1 of 4" forever with the
  // reason visible only in the browser console.
  //
  // Measured, with PostgREST stopped: 0 rows, 0 dialogs, one "Failed to fetch"
  // and an ERR_CONNECTION_REFUSED in the console, and a loading indicator that
  // never advances. Returning undefined instead produces the existing
  // "Error loading data. Please check the console for more details." alert.
  try {
    const rows = await fetchFromApi<ApiTerritory[]>(TERRITORY_QUERY);
    return toDictionary(rows.map(parseApiTerritory), (t) => t.ID);
  } catch (err) {
    console.error('Error loading territories from the API:', err);
    return undefined;
  }
}

/** JSON `null` means absent; every optional field on TerritoryData is `?:`, so
 *  leaving nulls in place would violate the type and change truthiness at every
 *  consumer. */
function orUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

export function parseApiTerritory(row: ApiTerritory): TerritoryData {
  const names = row.entity.entity_name;
  const nameDisplay = row.entity.name_display;
  const nameEndonym = orUndefined(row.name_endonym);

  // The endonym appears twice in entity_name terms: once as the value that also
  // sits on territory.name_endonym, and once for each OTHER endonym. Both carry
  // kind='endonym', so the column is the only thing that tells them apart -
  // position in the array is not stable and must not be used.
  const otherEndonyms = names
    .filter((n) => n.kind === 'endonym' && n.name !== nameEndonym)
    .map((n) => n.name);

  // Aliases hold the other exonyms, plus a copy of the display name that the
  // ETL writes from the Exonym column. Excluding by equality drops the copy.
  const otherExonyms = names
    .filter((n) => n.kind === 'alias' && n.name !== nameDisplay)
    .map((n) => n.name);

  // Population arrives once and is used three ways, exactly as the TSV path
  // does it: parseTerritoryLine sets overall and fromUN to the same number, and
  // loadTerritoryGDPLiteracy then derives speaking and writing from it.
  const population = row.population_from_un ?? 0;

  // GROUPS ARE SERVED RAW, and this is the subtlest thing in the file.
  //
  // D3 fills literacy, gdp, land area and coordinates for the 32 group
  // territories by rolling their children up - the same roll-up
  // computeContainedTerritoryStats does in the browser. Sending those values
  // would look like a free head start and is not one, because that function
  // assigns three of them with `??=`:
  //
  //     terr.gdp             ??= ...
  //     terr.literacyPercent ??= ...
  //     terr.pop.writing     ??= ...
  //
  // A value that is already present therefore BLOCKS the frontend computation
  // rather than being replaced by it. The two would agree only for as long as
  // D3 and computeTerritoryStats agree, and the day they diverge the browser
  // would silently defer to the database with nothing to show that it had.
  //
  // pop.overall, landArea and the coordinates are assigned unconditionally and
  // would converge either way. They are withheld too, so the rule is one rule:
  // Phase 1 changes where data comes from, not who computes it.
  //
  // Leaves are unaffected: their values come from the source files, not from
  // D3, and the parity harness shows all 257 already agreeing.
  const isGroup = isTerritoryGroup(row.scope as TerritoryScope);
  const literacyPercent = isGroup ? undefined : orUndefined(row.literacy_percent);

  return {
    type: ObjectType.Territory,

    ID: row.id,
    codeDisplay: row.id,
    codeAlpha3: orUndefined(row.code_alpha3),
    codeNumeric: orUndefined(row.code_numeric),

    nameDisplay,
    // The column is a smallint holding the enum's own numeric value, so this is
    // a cast rather than a lookup. TerritoryScope runs World=6 down to
    // Dependency=1, deliberately inverted so a larger value is a broader scope.
    scope: row.scope as TerritoryScope,

    pop: {
      overall: population,
      fromUN: population,
      // Only where literacy exists, matching loadTerritoryGDPLiteracy: a
      // territory absent from that file keeps both undefined rather than
      // gaining a speaking figure equal to its population.
      ...(literacyPercent != null
        ? { speaking: population, writing: population * (literacyPercent / 100) }
        : {}),
    },
    literacyPercent,
    gdp: isGroup ? undefined : orUndefined(row.gdp),
    landArea: isGroup ? undefined : orUndefined(row.land_area_km2),
    latitude: isGroup ? undefined : orUndefined(row.latitude),
    longitude: isGroup ? undefined : orUndefined(row.longitude),

    nameEndonym,
    nameOtherEndonyms: otherEndonyms.length > 0 ? otherEndonyms : undefined,
    nameOtherExonyms: otherExonyms.length > 0 ? otherExonyms : undefined,
    names: [nameDisplay, nameEndonym, ...otherEndonyms, ...otherExonyms].filter((n) => n != null),

    containedUNRegionCode: orUndefined(row.contained_un_region_id),
    sovereignCode: orUndefined(row.sovereign_id),
  };
}
