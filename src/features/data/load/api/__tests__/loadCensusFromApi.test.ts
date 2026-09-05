import { afterEach, describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import {
  CensusCollectorType,
  CensusLanguageUse,
  CensusQuantity,
} from '@entities/census/CensusTypes';

import {
  ApiCensus,
  censusIdFromSourceRef,
  collectLanguageNames,
  loadCensusFromApi,
  parseApiCensus,
} from '../loadCensusFromApi';

/**
 * These test the mapping only, against fixtures shaped exactly like the API's
 * JSON. They need no network and no database.
 *
 * Whether the mapping AGREES with the TSV path is a different question, and one
 * a unit test cannot answer: that is the 602-census field-by-field diff in
 * loadCensusParity.test.ts, which needs both paths and a running backend.
 */

/** Canada 2021, column 1: the fullest row in the dataset. */
const canada: ApiCensus = {
  id: 'ca2021.1',
  source_ref: 'official/ca2021.tsv#1',
  territory_id: 'CA',
  year_collected: 2021,
  language_use: 'Speaks',
  proficiency: 'Conversant or Learning',
  acquisition_order: 'Any',
  domain: 'Any',
  population: 36328480,
  population_source: null,
  population_surveyed: null,
  population_with_positive_responses: null,
  sample_rate: 0.25,
  sample_rate_note: null,
  responses_per_individual: '1+',
  age: '0+',
  gender: 'Any',
  nationality: null,
  residence_basis: null,
  languages_included: 'All',
  geographic_scope: 'Whole Country',
  quantity: 'count',
  notes: 'English and French are not counted in their language families.',
  collector_type: 'Government',
  collector_name: 'Statistics Canada',
  collector_name_short: 'StatCan',
  author: null,
  presenter_org_id: null,
  url: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810021601',
  date_published: '2022-08-17',
  date_accessed: '2025-05-30',
  document_name: null,
  section_name: null,
  table_name: 'Knowledge of languages by age and gender',
  column_name: 'Total - Single and multiple responses',
  citation: 'Statistics Canada. Table 98-10-0294-01',
  entity: { name_display: 'Canada 2021', code_display: 'ca2021.1' },
  census_language_estimate: [
    {
      language_id: 'afr',
      population_estimate: 29670,
      source_name: 'Afrikaans',
      is_name_bearing: true,
    },
    {
      language_id: 'eng',
      population_estimate: 31628570,
      source_name: 'English',
      is_name_bearing: true,
    },
  ],
};

/** A minimal row: everything nullable is null. */
const sparse: ApiCensus = {
  ...canada,
  id: 'xx.1',
  source_ref: 'unofficial/xx.tsv#1',
  language_use: null,
  proficiency: null,
  acquisition_order: null,
  domain: null,
  population: null,
  sample_rate: null,
  sample_rate_note: null,
  responses_per_individual: null,
  age: null,
  gender: null,
  languages_included: null,
  geographic_scope: null,
  quantity: null,
  notes: null,
  collector_type: null,
  collector_name: null,
  collector_name_short: null,
  url: null,
  date_published: null,
  date_accessed: null,
  table_name: null,
  column_name: null,
  citation: null,
  entity: { name_display: 'Sparse', code_display: 'xx.1' },
  census_language_estimate: [],
};

describe('parseApiCensus', () => {
  it('maps a fully populated census', () => {
    const census = parseApiCensus(canada);

    expect(census.type).toBe(EntityType.Census);
    expect(census.codeDisplay).toBe('ca2021.1');
    expect(census.nameDisplay).toBe('Canada 2021');
    expect(census.isoRegionCode).toBe('CA');
    expect(census.yearCollected).toBe(2021);
    expect(census.population).toBe(36328480);
    expect(census.url).toBe('https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810021601');
    expect(census.collectorName).toBe('Statistics Canada');
    expect(census.collectorNameShort).toBe('StatCan');
  });

  it('rebuilds the file-path ID, which is a lookup key and not the short id', () => {
    // getEntityFromID resolves censuses[entID] straight from a page param, so
    // this string appears in census detail URLs. The short id is codeDisplay.
    const census = parseApiCensus(canada);
    expect(census.ID).toBe('data/census/official/ca2021.tsv.1');
    expect(census.ID).not.toBe(census.codeDisplay);
  });

  it('maps enums, and falls back rather than inventing a valid-looking value', () => {
    expect(parseApiCensus(canada).languageUse).toBe(CensusLanguageUse.Speaks);
    expect(parseApiCensus(canada).collectorType).toBe(CensusCollectorType.Government);
    expect(parseApiCensus(canada).quantity).toBe(CensusQuantity.Count);

    // An absent collectorType is Unknown, which is what the file path
    // initialises it to; an absent languageUse and quantity stay undefined.
    expect(parseApiCensus(sparse).collectorType).toBe(CensusCollectorType.Unknown);
    expect(parseApiCensus(sparse).languageUse).toBeUndefined();
    expect(parseApiCensus(sparse).quantity).toBeUndefined();
  });

  it('never produces null for an optional field', () => {
    const census = parseApiCensus(sparse);
    // null satisfies neither the optional type nor a `!= null` guard.
    Object.entries(census).forEach(([key, value]) => {
      expect(value, `${key} should never be null`).not.toBeNull();
    });
    expect(census.proficiency).toBeUndefined();
    expect(census.notes).toBeUndefined();
    expect(census.citation).toBeUndefined();
  });

  it('parses dates into Date objects, not strings', () => {
    const census = parseApiCensus(canada);
    expect(census.datePublished).toBeInstanceOf(Date);
    expect(census.datePublished?.getUTCFullYear()).toBe(2022);
    expect(census.dateAccessed).toBeInstanceOf(Date);
    expect(parseApiCensus(sparse).datePublished).toBeUndefined();
  });

  it('keeps sampleRate a number, or the note when it is not numeric', () => {
    // The type is `number | string`: the ETL splits a parseable rate into
    // sample_rate and anything else into sample_rate_note.
    expect(parseApiCensus(canada).sampleRate).toBe(0.25);
    expect(parseApiCensus({ ...sparse, sample_rate_note: 'varies' }).sampleRate).toBe('varies');
    expect(parseApiCensus(sparse).sampleRate).toBeUndefined();
  });

  it('defaults a missing population to 0, matching the file path initialiser', () => {
    // population is NOT optional on CensusData, and parseCensusMetadata leaves
    // it at 0 when the metadata omits it.
    expect(parseApiCensus(sparse).population).toBe(0);
  });

  it('builds languageEstimates and derives languageCount from it', () => {
    const census = parseApiCensus(canada);
    expect(census.languageEstimates).toEqual({ afr: 29670, eng: 31628570 });
    expect(census.languageCount).toBe(2);
    expect(parseApiCensus(sparse).languageCount).toBe(0);
  });

  it('assembles names from nameDisplay, documentName and tableName', () => {
    // Exactly the three fields parseCensusMetadata uses, in that order.
    expect(parseApiCensus(canada).names).toEqual([
      'Canada 2021',
      'Knowledge of languages by age and gender',
    ]);
    expect(parseApiCensus(sparse).names).toEqual(['Sparse']);
  });

  it('recovers presentedBy as a short code by stripping the org. prefix', () => {
    // presentedBy is matched against org.codeDisplay, so it must be 'UNdata'
    // and not the 'org.UNdata' foreign key the ETL stored.
    const presented = parseApiCensus({ ...canada, presenter_org_id: 'org.UNdata' });
    expect(presented.presentedBy).toBe('UNdata');
    expect(parseApiCensus(canada).presentedBy).toBeUndefined();
  });
});

describe('censusIdFromSourceRef', () => {
  it('reconstructs the path form the file loader produces', () => {
    expect(censusIdFromSourceRef('official/ca2021.tsv#1')).toBe(
      'data/census/official/ca2021.tsv.1',
    );
    expect(censusIdFromSourceRef('data.un.org/ad.tsv#12')).toBe(
      'data/census/data.un.org/ad.tsv.12',
    );
    expect(censusIdFromSourceRef('axl/axl.bj.tsv#1')).toBe('data/census/axl/axl.bj.tsv.1');
  });
});

describe('collectLanguageNames', () => {
  it('takes names only from the name-bearing row of a multi-code row', () => {
    // 'ful/fue' gives its estimate to both codes but its name only to fue, the
    // LAST code - and fue sorts BEFORE ful, so alphabetical order gets this
    // wrong. The ETL flags the row because code order is not recoverable here.
    const names = collectLanguageNames([
      {
        ...canada,
        census_language_estimate: [
          {
            language_id: 'ful',
            population_estimate: 374892,
            source_name: 'Fulfulde',
            is_name_bearing: false,
          },
          {
            language_id: 'fue',
            population_estimate: 374892,
            source_name: 'Fulfulde',
            is_name_bearing: true,
          },
        ],
      },
    ]);
    expect(names).toEqual({ fue: 'Fulfulde' });
    expect(names.ful).toBeUndefined();
  });

  it("joins repeated names with ' / ', which addNewLanguageNames splits back", () => {
    const names = collectLanguageNames([
      {
        ...canada,
        census_language_estimate: [
          {
            language_id: 'ful',
            population_estimate: 1,
            source_name: 'Fula',
            is_name_bearing: true,
          },
        ],
      },
      {
        ...canada,
        census_language_estimate: [
          {
            language_id: 'ful',
            population_estimate: 2,
            source_name: 'Fufulde',
            is_name_bearing: true,
          },
        ],
      },
    ]);
    expect(names.ful).toBe('Fula / Fufulde');
  });

  it('skips rows with no source_name rather than storing a null', () => {
    const names = collectLanguageNames([
      {
        ...canada,
        census_language_estimate: [
          { language_id: 'eng', population_estimate: 1, source_name: null, is_name_bearing: true },
        ],
      },
    ]);
    expect(names).toEqual({});
  });
});

describe('loadCensusFromApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  /** An API loader must NEVER reject. CoreData and SupplementalData await the
   *  loaders and check results afterwards; a rejection skips that entirely. */
  it('resolves to an empty array when the API is unreachable', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(loadCensusFromApi()).resolves.toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      'Error loading censuses from the API:',
      expect.any(TypeError),
    );
  });

  it('resolves to an empty array on a non-200 response', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' }),
    );

    await expect(loadCensusFromApi()).resolves.toEqual([]);
  });

  it('resolves to an empty array on malformed JSON', async () => {
    // Phase 1 left this case untested for territories; it is covered here.
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
      }),
    );

    await expect(loadCensusFromApi()).resolves.toEqual([]);
  });

  it('returns one CensusImport with no warnings', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve([canada]) }),
    );

    const imports = await loadCensusFromApi();
    expect(imports).toHaveLength(1);
    const censusImport = imports[0];
    if (censusImport == null) throw new Error('expected a CensusImport');
    expect(censusImport.censuses).toHaveLength(1);
    expect(censusImport.censuses[0].codeDisplay).toBe('ca2021.1');
    expect(censusImport.languageNames).toEqual({ afr: 'Afrikaans', eng: 'English' });
    // The ETL reported its findings at load time, to a different audience.
    expect(censusImport.warnings).toEqual([]);
  });
});
