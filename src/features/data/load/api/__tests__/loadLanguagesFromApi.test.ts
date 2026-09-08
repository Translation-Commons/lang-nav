import { afterEach, describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { LanguageModality } from '@entities/language/LanguageModality';

import { ApiLanguage, loadLanguagesFromApi, parseApiLanguage } from '../loadLanguagesFromApi';

/**
 * These test the mapping only, against fixtures shaped exactly like the API's
 * JSON. They need no network and no database.
 *
 * Whether the mapping AGREES with the TSV path is a different question, and one
 * a unit test cannot answer: that is the 8,214-row field-by-field diff in
 * `loadLanguagesParity.test.ts`, which needs both paths and a running backend.
 * Census's port found seven defects and NONE of them were caught by unit tests.
 */

/** Spanish: an ordinary language, several sources represented. */
const spanish: ApiLanguage = {
  id: 'spa',
  name_canonical: 'Spanish',
  name_subtitle: null,
  name_endonym: 'espanol',
  modality: 0,
  primary_script_id: 'Latn',
  population_rough: 485000000,
  recommendation: 'Yes',
  recommendation_reason: 'Widely spoken',
  language_source_attribute: [
    {
      source: 'Combined',
      code: 'spa',
      name: 'Spanish',
      scope: 3,
      parent_language_id: 'roa',
      code_6391: null,
    },
    {
      source: 'Glottolog',
      code: 'stan1288',
      name: 'Spanish',
      scope: 3,
      parent_language_id: 'ibe',
      code_6391: null,
    },
    {
      source: 'ISO',
      code: 'spa',
      name: 'Spanish',
      scope: 3,
      parent_language_id: 'roa',
      code_6391: 'es',
    },
    {
      source: 'BCP',
      code: 'es',
      name: 'Spanish',
      scope: 3,
      parent_language_id: 'roa',
      code_6391: 'es',
    },
    {
      source: 'UNESCO',
      code: 'spa',
      name: 'Spanish',
      scope: 3,
      parent_language_id: 'roa',
      code_6391: null,
    },
  ],
  language_code_alias: [{ alias_code: 'stan1288' }],
};

/** Marwari: the name is ALREADY split by the ETL. */
const marwari: ApiLanguage = {
  id: 'rwr',
  name_canonical: 'Marwari',
  name_subtitle: 'India',
  name_endonym: null,
  modality: null,
  primary_script_id: null,
  population_rough: null,
  recommendation: null,
  recommendation_reason: null,
  language_source_attribute: [
    {
      source: 'Combined',
      code: 'rwr',
      name: 'Marwari',
      scope: 3,
      parent_language_id: 'mwr',
      code_6391: null,
    },
  ],
  language_code_alias: [],
};

/** Chinese: a macrolanguage with NO Glottolog attribute row, only an alias. */
const chinese: ApiLanguage = {
  id: 'zho',
  name_canonical: 'Chinese languages',
  name_subtitle: null,
  name_endonym: '中文',
  modality: 0,
  primary_script_id: 'Hans',
  population_rough: 1296041185,
  recommendation: 'Yes, with caveat',
  recommendation_reason: 'Huge macrolanguage category',
  language_source_attribute: [
    {
      source: 'Combined',
      code: 'zho',
      name: 'Chinese languages',
      scope: 4,
      parent_language_id: null,
      code_6391: null,
    },
    {
      source: 'ISO',
      code: 'zho',
      name: 'Chinese',
      scope: 4,
      parent_language_id: null,
      code_6391: 'zh',
    },
  ],
  language_code_alias: [{ alias_code: 'clas1255' }],
};

describe('parseApiLanguage', () => {
  it('maps the ordinary fields', () => {
    const language = parseApiLanguage(spanish);

    expect(language.type).toBe(EntityType.Language);
    expect(language.ID).toBe('spa');
    expect(language.codeDisplay).toBe('spa');
    expect(language.nameCanonical).toBe('Spanish');
    expect(language.nameDisplay).toBe('Spanish');
    expect(language.nameEndonym).toBe('espanol');
    expect(language.names).toEqual(['Spanish', 'espanol']);
    expect(language.modality).toBe(LanguageModality.SpokenAndWritten);
    expect(language.primaryScriptCode).toBe('Latn');
    expect(language.pop.rough).toBe(485000000);
  });

  it('reads viability from the recommendation columns, not viability_confidence', () => {
    // The ETL loads languages.tsv "Recommendation" columns under names taken
    // from the file. `language.viability_confidence` exists and is empty on
    // every row. Reading it would leave viabilityConfidence undefined for all
    // 8,126 languages that have one, and groupLanguagesBySource filters the
    // whole UNESCO dictionary on that field - so UNESCO would come back EMPTY.
    const language = parseApiLanguage(spanish);
    expect(language.viabilityConfidence).toBe('Yes');
    expect(language.viabilityExplanation).toBe('Widely spoken');
  });

  it('takes the name and subtitle as separate columns, already split', () => {
    // Re-splitting name_canonical drops every subtitle the ETL extracted - 314
    // of them - because the parenthetical is no longer in the string.
    const language = parseApiLanguage(marwari);
    expect(language.nameDisplay).toBe('Marwari');
    expect(language.nameSubtitle).toBe('India');
  });

  it('keeps a parenthetical that is part of the name', () => {
    // 614 languoids, mostly Glottolog, have parentheses in the canonical name
    // itself. Splitting on them would corrupt the name and invent a subtitle.
    const language = parseApiLanguage({
      ...marwari,
      id: 'abee1243',
      name_canonical: 'Abe (Anyin)',
      name_subtitle: null,
    });
    expect(language.nameDisplay).toBe('Abe (Anyin)');
    expect(language.nameSubtitle).toBeUndefined();
  });

  it('reads each source parent from its own row', () => {
    // Not derived from the Combined parent any more. The ETL fills Combined
    // from familiesToLanguages.tsv, which it deliberately does NOT apply to
    // UNESCO, so re-deriving gave 40+ languages a UNESCO parent the file path
    // never gives them.
    const language = parseApiLanguage(spanish);
    expect(language.Combined.parentLanguageCode).toBe('roa');
    expect(language.ISO.parentLanguageCode).toBe('roa');
    expect(language.BCP.parentLanguageCode).toBe('roa');
    expect(language.UNESCO.parentLanguageCode).toBe('roa');
  });

  it('leaves the ISO-family parents unset when the parent is a glottocode', () => {
    const language = parseApiLanguage({
      ...marwari,
      language_source_attribute: [
        {
          source: 'Combined',
          code: 'rwr',
          name: 'Marwari',
          scope: 3,
          parent_language_id: 'indo1319',
          code_6391: null,
        },
      ],
    });
    expect(language.Combined.parentLanguageCode).toBe('indo1319');
    expect(language.ISO).toEqual({});
    expect(language.BCP).toEqual({});
    expect(language.UNESCO).toEqual({});
  });

  it('falls back to the glottocode alias when there is no Glottolog row', () => {
    // 56 languages, the macrolanguages among them. The ETL writes the Glottolog
    // attribute row while walking glottolog.tsv and stores the languages.tsv
    // glottocode only as an alias, so when the two disagree there is no row.
    expect(parseApiLanguage(chinese).Glottolog.code).toBe('clas1255');
  });

  it('prefers the Glottolog row over the alias where both exist', () => {
    expect(parseApiLanguage(spanish).Glottolog.code).toBe('stan1288');
  });

  it('converts null to undefined rather than leaving it', () => {
    const language = parseApiLanguage(marwari);
    expect(language.nameEndonym).toBeUndefined();
    expect(language.modality).toBeUndefined();
    expect(language.primaryScriptCode).toBeUndefined();
    expect(language.pop.rough).toBeUndefined();
    expect(language.viabilityConfidence).toBeUndefined();
  });

  it('starts scope unset, leaving it to the ISO merge step', () => {
    expect(parseApiLanguage(spanish).scope).toBeUndefined();
  });

  it('gives every language the empty collections the type requires', () => {
    const language = parseApiLanguage(marwari);
    expect(language.locales).toEqual([]);
    expect(language.childLanguages).toEqual([]);
    expect(language.writingSystems).toEqual({});
    expect(language.warnings).toEqual({});
    expect(language.vitality).toEqual({});
    expect(language.CLDR).toEqual({});
  });
});

describe('loadLanguagesFromApi', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('resolves to undefined rather than rejecting when the API is unreachable', async () => {
    // CoreData.tsx awaits every loader in one Promise.all and then checks for
    // null. A rejected promise skips that check: the alert never runs and the
    // loading indicator sticks at "1 of 4" with the cause only in the console.
    vi.stubEnv('VITE_API_URL', 'http://localhost:9');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('ECONNREFUSED'))),
    );

    await expect(loadLanguagesFromApi()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('rewrites Glottolog parents from language ids to glottocodes', async () => {
    // The ETL stores parent_language_id, which is right for a foreign key and
    // wrong for this field: parseLanguageLine reads the parent GLOTTOCODE from
    // column 9. Left alone this would not converge.
    vi.stubEnv('VITE_API_URL', 'http://example.test');
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                ...spanish,
                language_source_attribute: [
                  {
                    source: 'Glottolog',
                    code: 'stan1288',
                    name: 'Spanish',
                    scope: 3,
                    parent_language_id: 'ibe',
                    code_6391: null,
                  },
                ],
              },
              {
                ...marwari,
                id: 'ibe',
                language_source_attribute: [
                  {
                    source: 'Glottolog',
                    code: 'iber1250',
                    name: 'Ibero-Romance',
                    scope: 5,
                    parent_language_id: null,
                    code_6391: null,
                  },
                ],
              },
            ]),
        } as Response),
      ),
    );

    const languages = await loadLanguagesFromApi();
    expect(languages).toBeDefined();
    expect(languages && languages['spa'].Glottolog.parentLanguageCode).toBe('iber1250');
  });
});
