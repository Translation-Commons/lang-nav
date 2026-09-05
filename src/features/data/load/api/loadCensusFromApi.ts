import { EntityType } from '@features/params/PageParamTypes';

import {
  CensusCollectorType,
  CensusData,
  CensusLanguageUse,
  CensusQuantity,
} from '@entities/census/CensusTypes';
import { LanguageCode } from '@entities/language/LanguageTypes';

import { CensusImport } from '../extra_entities/loadCensusData';

import { fetchFromApi } from './apiConfig';

/**
 * Loads censuses from the API instead of from 169 TSV files.
 *
 * The ETL merged `census/{official,data.un.org,unofficial,axl}/*.tsv` into the
 * `census` and `census_language_estimate` tables, so one request replaces the
 * four `censusList.txt` manifests and every file they name. **169 requests
 * become 1** - the largest single reduction in the migration; territories were
 * five.
 *
 * The returned shape is a `CensusImport`, the same triple `parseCensusImport()`
 * produces, so `SupplementalData.tsx` cannot tell the two apart. It returns a
 * ONE-ELEMENT array where the file path returns 169, because the API has no
 * per-file boundary to preserve and nothing downstream depends on one:
 * `addCensusData` is called per import and its effects accumulate.
 */

/** One `census_language_estimate` row. */
type ApiCensusLanguageEstimate = {
  language_id: string;
  population_estimate: number;
  source_name: string | null;
  is_name_bearing: boolean;
};

/** The embedded `entity` row, which holds the display name and code. */
type ApiCensusEntity = {
  name_display: string;
  code_display: string;
};

export type ApiCensus = {
  id: string;
  source_ref: string;
  territory_id: string;
  year_collected: number;
  language_use: string | null;
  proficiency: string | null;
  acquisition_order: string | null;
  domain: string | null;
  population: number | null;
  population_source: string | null;
  population_surveyed: number | null;
  population_with_positive_responses: number | null;
  sample_rate: number | null;
  sample_rate_note: string | null;
  responses_per_individual: string | null;
  age: string | null;
  gender: string | null;
  nationality: string | null;
  residence_basis: string | null;
  languages_included: string | null;
  geographic_scope: string | null;
  quantity: string | null;
  notes: string | null;
  collector_type: string | null;
  collector_name: string | null;
  collector_name_short: string | null;
  author: string | null;
  presenter_org_id: string | null;
  url: string | null;
  date_published: string | null;
  date_accessed: string | null;
  document_name: string | null;
  section_name: string | null;
  table_name: string | null;
  column_name: string | null;
  citation: string | null;
  entity: ApiCensusEntity;
  census_language_estimate: ApiCensusLanguageEstimate[];
};

// Every column is named. `select=*` also returns created_at, updated_at and
// language_count, which nothing here reads - it measured 2.35 MB against
// 2.13 MB for this list.
//
// `language_count` is deliberately NOT selected even though the column exists:
// the file path derives it while counting estimates into languageEstimates, and
// deriving it here keeps the two paths computing the same number from the same
// rows rather than trusting the ETL's count to agree.
//
// The embedded estimates are ordered explicitly. Postgres promises nothing
// about row order without an ORDER BY, and languageEstimates is built by
// iterating them, so an unordered embed could reshuffle between two identical
// requests - stable until a vacuum moves the rows, which is the worst kind of
// unstable.
const CENSUS_QUERY =
  '/census?select=id,source_ref,territory_id,year_collected,language_use,proficiency,' +
  'acquisition_order,domain,population,population_source,population_surveyed,' +
  'population_with_positive_responses,sample_rate,sample_rate_note,' +
  'responses_per_individual,age,gender,nationality,residence_basis,' +
  'languages_included,geographic_scope,quantity,notes,collector_type,' +
  'collector_name,collector_name_short,author,presenter_org_id,url,date_published,' +
  'date_accessed,document_name,section_name,table_name,column_name,citation,' +
  'entity(name_display,code_display),' +
  'census_language_estimate(language_id,population_estimate,source_name,is_name_bearing)' +
  '&census_language_estimate.order=language_id.asc&order=id.asc';

/** JSON `null` satisfies neither an optional field's type nor a `!= null`
 *  guard, so every optional field goes through this. */
function orUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

/**
 * Rebuilds the ID the file path uses, which is the full path plus the column
 * number - `data/census/official/ca2021.tsv.1`, not `ca2021.1`.
 *
 * This matters because `ID` is a LOOKUP KEY, not a label: `getEntityFromID`
 * resolves `censuses[entID]` straight from a page parameter, so it appears in
 * census detail URLs. Using the database's short id here would change every
 * such URL between the two paths and break links made against the other one.
 * The short id is what `codeDisplay` carries, on both paths.
 *
 * `source_ref` is stored as `official/ca2021.tsv#1`, which holds the directory,
 * the filename and the column index - everything the file-path ID needs.
 */
export function censusIdFromSourceRef(sourceRef: string): string {
  const [path, column] = sourceRef.split('#');
  return `data/census/${path}.${column}`;
}

/** Enum values are stored as their string form, but a value that fails to match
 *  must not silently become a valid-looking one. The file path warns and keeps
 *  the raw string; here an unrecognised value is dropped, since the ETL already
 *  rejected and reported invalid values at load time. */
function toLanguageUse(value: string | null): CensusLanguageUse | undefined {
  const match = Object.values(CensusLanguageUse).find((use) => use === value);
  return match ?? undefined;
}

function toCollectorType(value: string | null): CensusCollectorType {
  const match = Object.values(CensusCollectorType).find((type) => type === value);
  return match ?? CensusCollectorType.Unknown;
}

/** NULL means the source file did not state a quantity, which the frontend
 *  represents as undefined. The column is nullable precisely so that "not
 *  stated" and an explicit 'count' stay distinguishable. */
function toQuantity(value: string | null): CensusQuantity | undefined {
  return Object.values(CensusQuantity).find((q) => q === value?.toLowerCase());
}

export function parseApiCensus(row: ApiCensus): CensusData {
  const languageEstimates: Record<LanguageCode, number> = {};
  row.census_language_estimate.forEach((estimate) => {
    languageEstimates[estimate.language_id] = estimate.population_estimate;
  });

  const nameDisplay = row.entity.name_display;
  const documentName = orUndefined(row.document_name);
  const tableName = orUndefined(row.table_name);

  return {
    type: EntityType.Census,
    ID: censusIdFromSourceRef(row.source_ref),
    codeDisplay: row.entity.code_display,
    nameDisplay,
    // Assembled exactly as parseCensusMetadata does, from the same three
    // fields in the same order, rather than from entity_name - the ETL also
    // writes those names there, but with a unique key that collapses a
    // document name equal to the display name.
    names: [nameDisplay, documentName, tableName].filter((name) => name != null),

    isoRegionCode: row.territory_id,
    yearCollected: row.year_collected,

    languageUse: toLanguageUse(row.language_use),
    proficiency: orUndefined(row.proficiency),
    acquisitionOrder: orUndefined(row.acquisition_order),
    domain: orUndefined(row.domain),

    // The file path leaves population at its 0 initialiser when the metadata
    // omits it, and the field is not optional, so null becomes 0 rather than
    // undefined.
    population: row.population ?? 0,
    populationSource: orUndefined(row.population_source),
    populationSurveyed: orUndefined(row.population_surveyed),
    populationWithPositiveResponses: orUndefined(row.population_with_positive_responses),
    // One column of the two the ETL splits sampleRate into: a numeric rate
    // lands in sample_rate, anything unparseable in sample_rate_note. The
    // frontend type is `number | string` and the file path produces exactly
    // that via `Number.parseFloat(value) || value`.
    sampleRate: row.sample_rate ?? orUndefined(row.sample_rate_note),
    responsesPerIndividual: orUndefined(row.responses_per_individual),

    languagesIncluded: orUndefined(row.languages_included),
    geographicScope: orUndefined(row.geographic_scope),
    age: orUndefined(row.age),
    gender: orUndefined(row.gender),
    nationality: orUndefined(row.nationality),
    residenceBasis: orUndefined(row.residence_basis),
    quantity: toQuantity(row.quantity),
    notes: orUndefined(row.notes),

    collectorType: toCollectorType(row.collector_type),
    collectorName: orUndefined(row.collector_name),
    collectorNameShort: orUndefined(row.collector_name_short),
    author: orUndefined(row.author),
    // `presentedBy` is a short org CODE, matched against `org.codeDisplay` in
    // addCensusToOrganizations - not a name. The ETL resolved it to a foreign
    // key by prefixing 'org.', so the code is recovered by stripping that back
    // off. All 8 distinct presenters in the source files are known
    // organizations, so the FK loses nothing here.
    presentedBy: orUndefined(row.presenter_org_id?.replace(/^org\./, '')),

    url: row.url ?? '',
    datePublished: row.date_published != null ? new Date(row.date_published) : undefined,
    dateAccessed: row.date_accessed != null ? new Date(row.date_accessed) : undefined,
    documentName,
    sectionName: orUndefined(row.section_name),
    tableName,
    columnName: orUndefined(row.column_name),
    citation: orUndefined(row.citation),

    languageCount: Object.keys(languageEstimates).length,
    languageEstimates,
  };
}

/**
 * The alternative language names a census used, which feed search.
 *
 * Only rows flagged `is_name_bearing` contribute. A source row may list several
 * codes (`ful/fue`) and the estimate applies to all of them, but the NAME goes
 * to the last code alone - `parseCensusLanguageRow.ts` picks
 * `codes[codes.length - 1]`. Code order cannot be recovered from
 * `(census_id, language_id)`, which is why the ETL flags the row instead.
 *
 * Repeats accumulate joined by ' / ', which is what the file path builds and
 * what `addNewLanguageNames` splits back apart on `/`.
 */
export function collectLanguageNames(rows: ApiCensus[]): Record<LanguageCode, string> {
  const languageNames: Record<LanguageCode, string> = {};
  rows.forEach((row) => {
    row.census_language_estimate.forEach((estimate) => {
      if (!estimate.is_name_bearing || estimate.source_name == null) return;
      const existing = languageNames[estimate.language_id];
      languageNames[estimate.language_id] =
        existing != null ? `${existing} / ${estimate.source_name}` : estimate.source_name;
    });
  });
  return languageNames;
}

export async function loadCensusFromApi(): Promise<(CensusImport | void)[]> {
  try {
    const rows = await fetchFromApi<ApiCensus[]>(CENSUS_QUERY);
    return [
      {
        censuses: rows.map(parseApiCensus),
        languageNames: collectLanguageNames(rows),
        // The file path's warnings come from parsing the TSVs. The ETL does
        // that work at load time and reports its own findings to
        // data_quality_finding and the terminal, for a different audience;
        // they are not recoverable per-request and are not invented here.
        warnings: [],
      },
    ];
  } catch (err) {
    // Resolves rather than rejects, exactly as loadCensusData's per-file catch
    // does. A rejection here would escape SupplementalData's await and take out
    // every later supplemental step with it.
    console.error('Error loading censuses from the API:', err);
    return [];
  }
}
