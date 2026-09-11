import { afterEach, describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { LocaleSource, PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import { ApiLocale, loadLocalesFromApi, parseApiLocale } from '../loadLocalesFromApi';

/**
 * These test the mapping only, against fixtures shaped exactly like the API's
 * JSON. They need no network and no database.
 *
 * Whether the mapping AGREES with the TSV path is a different question, and one
 * a unit test cannot answer: that is the 11,016-row field-by-field diff in
 * `loadLocalesParity.test.ts`, which needs both paths and a running backend.
 * Census's port found seven defects and NONE of them were caught by unit tests;
 * language's found six, also none.
 */

/** An ordinary curated locale: language and territory, no script, no variants. */
const ghotuoNigeria: ApiLocale = {
  id: 'aaa_NG',
  language_id: 'aaa',
  script_id: null,
  territory_id: 'NG',
  variant_key: '',
  name_endonym: null,
  official_status: null,
  pop_speaking_unadjusted: 1000,
  pop_speaking_source: 'Other',
  entity: { name_display: 'Ghotuo (Nigeria)' },
};

/** Every optional part filled: script, endonym, official status. */
const azerbaijaniIraq: ApiLocale = {
  id: 'aze_Arab_IQ',
  language_id: 'aze',
  script_id: 'Arab',
  territory_id: 'IQ',
  variant_key: '',
  name_endonym: 'Azərbaycan dili',
  official_status: 'official_regional',
  pop_speaking_unadjusted: 757501,
  pop_speaking_source: 'CLDR',
  entity: { name_display: 'Azerbaijani (Iraq, Arabic)' },
};

/** One of the seven Romansh idioms. The id in the database is the string as it
 *  was typed in locales.tsv, with the variant subtag UPPERCASE. */
const romanshSursilvan: ApiLocale = {
  id: 'roh_CH_SURSILV',
  language_id: 'roh',
  script_id: null,
  territory_id: 'CH',
  variant_key: 'sursilv',
  name_endonym: null,
  official_status: null,
  pop_speaking_unadjusted: 17882,
  pop_speaking_source: 'Official',
  entity: { name_display: 'Rumantsch (Switzerland, Sursilvan)' },
};

/** The only curated locale with no territory at all, and it has a variant. */
const basicEnglish: ApiLocale = {
  id: 'eng_basiceng',
  language_id: 'eng',
  script_id: null,
  territory_id: null,
  variant_key: 'basiceng',
  name_endonym: null,
  official_status: null,
  pop_speaking_unadjusted: null,
  pop_speaking_source: null,
  entity: { name_display: 'English (Simple)' },
};

describe('parseApiLocale', () => {
  it('maps every field the TSV loader sets', () => {
    expect(parseApiLocale(azerbaijaniIraq)).toEqual({
      type: EntityType.Locale,
      ID: 'aze_Arab_IQ',
      codeDisplay: 'aze_Arab_IQ',
      localeSource: LocaleSource.StableDatabase,
      nameDisplay: 'Azerbaijani (Iraq, Arabic)',
      nameEndonym: 'Azərbaycan dili',
      names: ['Azerbaijani (Iraq, Arabic)', 'Azərbaycan dili'],
      languageCode: 'aze',
      territoryCode: 'IQ',
      scriptCode: 'Arab',
      variantCodes: [],
      officialStatus: 'official_regional',
      pop: {
        speaking: { unadjusted: 757501, source: PopulationSourceCategory.CLDR },
        writing: {},
        rough: 757501,
      },
    });
  });

  it('rebuilds the ID from the parts, lowercasing variant subtags', () => {
    // The database holds `roh_CH_SURSILV`, the string locales.tsv carries.
    // parseLocaleCode lowercases variants, so the browser holds
    // `roh_CH_sursilv`, and the id is the key for ents[] lookups and URLs.
    // Passing row.id through would give eight locales an id nothing else uses.
    const locale = parseApiLocale(romanshSursilvan);
    expect(locale.ID).toBe('roh_CH_sursilv');
    expect(locale.codeDisplay).toBe('roh_CH_sursilv');
    expect(locale.variantCodes).toEqual(['sursilv']);
  });

  it('keeps a locale that has a variant but no territory', () => {
    const locale = parseApiLocale(basicEnglish);
    expect(locale.ID).toBe('eng_basiceng');
    expect(locale.territoryCode).toBeUndefined();
    expect(locale.variantCodes).toEqual(['basiceng']);
  });

  it('reads an empty variant_key as no variants, not as one empty variant', () => {
    // ''.split('.') is [''], which would put a phantom subtag on 11,008 locales.
    expect(parseApiLocale(ghotuoNigeria).variantCodes).toEqual([]);
  });

  it('turns a NULL population source into the empty string, not undefined', () => {
    // PopulationSourceCategory.NoSource IS '', and parseLocaleLine stores '' for
    // the 2,046 locales whose source cell is blank. LocaleCensusCitation renders
    // on `source != null`, so '' shows "no citation" and undefined shows "n/a".
    const locale = parseApiLocale(basicEnglish);
    expect(locale.pop.speaking.source).toBe(PopulationSourceCategory.NoSource);
    expect(locale.pop.speaking.source).toBe('');
    expect(locale.pop.speaking.source).not.toBeUndefined();
  });

  it('passes a real population source through unchanged', () => {
    expect(parseApiLocale(ghotuoNigeria).pop.speaking.source).toBe(PopulationSourceCategory.Other);
  });

  it('converts null to undefined for every other optional field', () => {
    const locale = parseApiLocale(ghotuoNigeria);
    expect(locale.scriptCode).toBeUndefined();
    expect(locale.nameEndonym).toBeUndefined();
    expect(locale.officialStatus).toBeUndefined();
    expect(parseApiLocale(basicEnglish).pop.speaking.unadjusted).toBeUndefined();
  });

  it('drops the endonym from names when there is none', () => {
    expect(parseApiLocale(ghotuoNigeria).names).toEqual(['Ghotuo (Nigeria)']);
  });

  it('sets both pop.rough and pop.speaking.unadjusted from the curated column', () => {
    // parseLocaleLine sets both from the single "Population" column. The column
    // read is pop_speaking_unadjusted, NOT pop_speaking_unadjusted_derived -
    // the derived one holds what the winning census reported, which is what
    // applyPopRecord will overwrite this with later.
    const locale = parseApiLocale(romanshSursilvan);
    expect(locale.pop.speaking.unadjusted).toBe(17882);
    expect(locale.pop.rough).toBe(17882);
    expect(locale.pop.writing).toEqual({});
  });

  it('always reports the StableDatabase source', () => {
    // The query filters to locale_source=eq.StableDatabase, so the 23,543
    // regional and 21,255 family locales the ETL generated never arrive here.
    // The browser builds those itself in connectEntitiesAndCreateDerivedData.
    expect(parseApiLocale(ghotuoNigeria).localeSource).toBe(LocaleSource.StableDatabase);
  });

  it('withholds every field the browser computes', () => {
    // Sending any of these would seed the browser with a value it is about to
    // recompute, and hide a disagreement rather than surface it.
    const locale = parseApiLocale(azerbaijaniIraq);
    expect(locale.literacyPercent).toBeUndefined();
    expect(locale.langFormedHere).toBeUndefined();
    expect(locale.historicPresence).toBeUndefined();
    expect(locale.ecrmlProtection).toBeUndefined();
    expect(locale.pop.speaking.adjusted).toBeUndefined();
    expect(locale.pop.speaking.percent).toBeUndefined();
    expect(locale.pop.speaking.census).toBeUndefined();
    expect(locale.censusRecords).toBeUndefined();
  });
});

describe('loadLocalesFromApi', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keys the dictionary by the rebuilt ID', async () => {
    vi.stubEnv('VITE_API_URL', 'http://example.test');
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([ghotuoNigeria, romanshSursilvan]),
        }),
      ),
    );

    const locales = await loadLocalesFromApi();
    expect(Object.keys(locales ?? {}).sort()).toEqual(['aaa_NG', 'roh_CH_sursilv']);
  });

  it('requests only the StableDatabase rows, ordered, with named columns', async () => {
    vi.stubEnv('VITE_API_URL', 'http://example.test');
    const fetchMock = vi.fn<(...args: unknown[]) => Promise<unknown>>(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await loadLocalesFromApi();

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('locale_source=eq.StableDatabase');
    expect(url).toContain('order=id.asc');
    expect(url).toContain('variant_key');
    expect(url).toContain('entity(name_display)');
    // Never select=*: it is 50.27 MB against 2.78 MB here.
    expect(url).not.toContain('select=*');
    // The derived columns must not be selected at all.
    expect(url).not.toContain('pop_speaking_adjusted');
    expect(url).not.toContain('unadjusted_derived');
    expect(url).not.toContain('literacy_percent');
  });

  it('resolves to undefined rather than rejecting when the API is unreachable', async () => {
    // CoreData.tsx awaits every loader in one Promise.all and then checks for
    // null. A rejected promise skips that check, so the alert never runs and
    // the loading indicator sticks forever.
    vi.stubEnv('VITE_API_URL', 'http://example.test');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('ECONNREFUSED'))),
    );

    await expect(loadLocalesFromApi()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});
