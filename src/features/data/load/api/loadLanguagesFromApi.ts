import { EntityType } from '@features/params/PageParamTypes';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageData, LanguageDictionary, LanguageSource } from '@entities/language/LanguageTypes';

import { toDictionary } from '@shared/lib/setUtils';

import { fetchFromApi } from './apiConfig';

/**
 * Loads languages from the API instead of from `languages.tsv`.
 *
 * SCOPE: this replaces `parseLanguageLine` ONLY. The eight merge steps in
 * CoreData.tsx still run - ISO codes, families, macrolanguages, retirements,
 * Glottolog, the Combined overrides, CLDR and IANA variants all still arrive
 * from their own files and still overwrite what this returns. That is
 * deliberate for this step: `__tests__/loadLanguagesParity.test.ts` compares
 * loader output, and a loader that returned the post-merge state could not be
 * compared against anything.
 *
 * Consequently this sends the RAW columns languages.tsv carries and nothing
 * else. The `language` table also holds D7-D10's derived populations, depths,
 * descendant counts and largest-descendant links; none of them are selected,
 * because the browser still computes all of them.
 *
 * The request count therefore does NOT drop yet: one file becomes one request,
 * and the eight merge steps still fetch their own files. Banking that saving
 * means deleting those steps, which is a separate change - and FP-036 has to be
 * fixed first, because `Glottolog.parentLanguageCode` for 56 languages is
 * currently supplied by `addGlottologLanguages` and is in no column the API can
 * return.
 */

/** One `language_code_alias` row. Only the glottocode kind is selected. */
type ApiLanguageCodeAlias = {
  alias_code: string;
};

/** One `language_source_attribute` row, one per (language, source) pair. */
type ApiLanguageSourceAttribute = {
  source: string;
  code: string | null;
  parent_language_id: string | null;
};

export type ApiLanguage = {
  id: string;
  name_canonical: string;
  name_subtitle: string | null;
  name_endonym: string | null;
  modality: number | null;
  primary_script_id: string | null;
  population_rough: number | null;
  // NOT viability_confidence / viability_explanation. See RECOMMENDATION_COLUMNS.
  recommendation: string | null;
  recommendation_reason: string | null;
  language_source_attribute: ApiLanguageSourceAttribute[];
  language_code_alias: ApiLanguageCodeAlias[];
};

/**
 * THE COLUMN NAMES ARE recommendation / recommendation_reason, NOT
 * viability_confidence / viability_explanation.
 *
 * languages.tsv has 11 columns and `parseLanguageLine` reads indices 9 and 10 -
 * "Recommendation" and "Recommendation Reason" - into `viabilityConfidence` and
 * `viabilityExplanation`. The ETL loads the same two columns into `language`
 * columns named after the FILE, while `language.viability_confidence` and
 * `.viability_explanation` exist but are empty: 0 rows against 8,126.
 *
 * The schema comment on those columns says "Q2: the parser reads these from
 * out-of-range columns and they are always NULL at runtime". That is wrong -
 * indices 9 and 10 are in range in an 11-column file, and both are populated.
 *
 * Reading the same-sounding column would not fail loudly. It would return
 * undefined for every language, and `groupLanguagesBySource` filters the entire
 * UNESCO dictionary on `viabilityConfidence != null && != 'No'`, so the UNESCO
 * source would silently come back EMPTY. See FP-034.
 */
const RECOMMENDATION_COLUMNS = 'recommendation,recommendation_reason';

/**
 * One request, one embed.
 *
 * The foreign key MUST be named. `language_source_attribute` references
 * `language` three times - `language_id`, `parent_language_id` and
 * `largest_descendant_id` - and PostgREST refuses to guess between them,
 * failing with PGRST201. The constraint name in this URL is more brittle than a
 * column name would be; if it starts appearing in more loaders that is the
 * trigger for the `api` schema of views (FP-021).
 *
 * SELECT ONLY WHAT IS PARSED. The embed carries `source`, `code` and
 * `parent_language_id` and nothing else - adding `name`, `scope` and
 * `code_6391`, none of which this mapper reads, costs 8.3 MB: measured at
 * 19.41 MB raw / 1,182 KB gzipped against 11.12 MB / 795 KB, on 60,213 embedded
 * rows. Against the 755 KB the eight files it will eventually replace compress
 * to, that is the difference between rough parity and half as much again.
 *
 * PostgREST cannot compress - there is no setting for it - so the gzipped
 * figure only exists behind whatever proxy fronts it in a deployment. On
 * localhost the full 11 MB crosses the wire.
 *
 * `order=` is set on BOTH levels. Postgres promises nothing about row order
 * without it, embedded rows included, and the attribute rows decide which
 * source-specific sub-object wins if a source ever appeared twice. Ordering by
 * id gives insertion order, which is the file's order.
 */
const LANGUAGE_QUERY =
  '/language?select=id,name_canonical,name_subtitle,name_endonym,modality,' +
  `primary_script_id,population_rough,${RECOMMENDATION_COLUMNS},` +
  'language_source_attribute!language_source_attribute_language_id_fkey' +
  '(source,code,parent_language_id),' +
  'language_code_alias(alias_code)' +
  '&language_code_alias.alias_kind=eq.glottocode' +
  '&language_source_attribute.order=source.asc' +
  '&language_code_alias.order=alias_code.asc&order=id.asc';

export async function loadLanguagesFromApi(): Promise<LanguageDictionary | void> {
  // Resolves to undefined on failure, never rejects. CoreData.tsx awaits every
  // loader in one Promise.all and then checks the results for null; a rejected
  // promise skips that check entirely, so the alert never runs and the loading
  // indicator sticks forever with the cause only in the console.
  try {
    const rows = await fetchFromApi<ApiLanguage[]>(LANGUAGE_QUERY);
    const languages = toDictionary(rows.map(parseApiLanguage), (lang) => lang.ID);
    return resolveGlottologParents(languages, rows);
  } catch (err) {
    console.error('Error loading languages from the API:', err);
    return undefined;
  }
}

/** JSON `null` means absent; every optional field on LanguageData is `?:`, so
 *  leaving nulls in place would violate the type and change truthiness at every
 *  consumer. */
function orUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

export function parseApiLanguage(row: ApiLanguage): LanguageData {
  const attributes = new Map(row.language_source_attribute.map((a) => [a.source, a]));
  const combined = attributes.get(LanguageSource.Combined);
  const glottolog = attributes.get(LanguageSource.Glottolog);

  // The ETL HAS ALREADY SPLIT THE NAME. `name_canonical` is the title alone and
  // `name_subtitle` the parenthetical, so both are read straight off the row.
  //
  // Re-splitting `name_canonical` here looks equivalent and is not. It drops
  // every subtitle the ETL extracted - 314 of them, `rwr` "Marwari (India)"
  // among them - because the parenthetical is no longer in the string to find.
  // It would also corrupt the 614 languoids, mostly Glottolog names, whose
  // canonical name legitimately CONTAINS parentheses that are part of the name.
  // Read straight from the columns, the two paths agree on all 8,214.
  const nameDisplay = row.name_canonical;
  const nameSubtitle = orUndefined(row.name_subtitle);

  const nameEndonym = orUndefined(row.name_endonym);
  const code = row.id;

  // The TSV reads the parent from column 8 and applies it two ways: verbatim to
  // Combined, and to the three ISO-family sources only when it is short enough
  // to be an ISO code. The database splits the same value across per-source
  // rows, so Combined's parent is read back from the Combined attribute row.
  // Where a language carries several glottocode aliases the attribute row's own
  // code wins above; this only ever supplies one for a language that has no
  // Glottolog row at all, so the first is the only one on offer.
  const glottocodeAlias = orUndefined(row.language_code_alias[0]?.alias_code ?? null);

  const parentLanguageCode = orUndefined(combined?.parent_language_id);

  const language: LanguageData = {
    type: EntityType.Language,

    ID: code,
    codeDisplay: code,
    // Set by addISODataToLanguages from iso-639-3.tab, which still runs. The
    // database has a per-source scope, but adopting it here would let the API
    // path start with a value the file path only acquires later.
    scope: undefined,

    nameCanonical: nameDisplay,
    nameDisplay,
    nameSubtitle,
    nameEndonym,
    names: [nameDisplay, nameEndonym].filter((s) => s != null),

    vitality: {}, // Filled in later
    viabilityConfidence: orUndefined(row.recommendation),
    viabilityExplanation: orUndefined(row.recommendation_reason),

    // A smallint holding the enum's own value, so this is a cast, not a lookup.
    // LanguageModality runs Written=-2 up to Sign=3 and `language_modality`
    // stores the identical six ids; verified against the vocab table.
    modality: orUndefined(row.modality) as LanguageModality | undefined,
    primaryScriptCode: orUndefined(row.primary_script_id),

    warnings: {},
    locales: [],
    writingSystems: {},
    childLanguages: [],
    variants: [],

    pop: {
      speaking: {},
      writing: {},
      rough: orUndefined(row.population_rough),
    },

    Combined: { code, name: nameDisplay, parentLanguageCode },
    Glottolog: {
      // The glottocode comes from the Glottolog attribute row where one exists,
      // and from `language_code_alias` where it does not.
      //
      // 56 languages have no Glottolog attribute row even though languages.tsv
      // gives them a glottocode - the macrolanguages (`zho`, `ara`, `fas`,
      // `msa`, `grn`, `aze`...) and the private-use tags. The ETL writes that
      // row while walking glottolog.tsv, keyed on the glottocode found THERE,
      // and stores languages.tsv's own glottocode only as an alias. When the
      // two disagree the row is never written: `zho` points at `clas1255`,
      // which glottolog.tsv lists as a family node of its own with no ISO code,
      // so it stays a separate languoid and `zho` is left with nothing.
      //
      // The file path has no such gap - parseLanguageLine reads column 2
      // unconditionally - so the alias is what reproduces it. It is the same
      // column, not a derived value. See FP-036.
      code: orUndefined(glottolog?.code) ?? glottocodeAlias,
      parentLanguageCode: orUndefined(glottolog?.parent_language_id),
    },
    ISO: {},
    BCP: {},
    UNESCO: {},
    CLDR: {},
  };
  // Each source's parent comes from ITS OWN row. No fallback: the ETL now
  // defers the languages.tsv column-8 parents until the families exist
  // (FP-035), so ISO and BCP hold everything the file gives them.
  //
  // A Combined-parent fallback was tried and removed. It fired on 71
  // languages: 13 correctly and 58 WRONGLY, because a Combined parent that
  // came from familiesToLanguages.tsv is indistinguishable in the database
  // from one the ETL dropped, and the file path applies that file to ISO and
  // BCP only - never to UNESCO, and only via `??=` after the merge. Deriving
  // it here front-ran that step and handed `que`, `eus` and `pbb` a UNESCO
  // parent the file path never gives them.
  //
  // `dyl` and `lfb` still lack a UNESCO parent the file gives them. That is
  // FP-043, two rows, and it needs an answer about the UNESCO tree rather than
  // a rule here.
  const isoParent = orUndefined(attributes.get(LanguageSource.ISO)?.parent_language_id);
  const bcpParent = orUndefined(attributes.get(LanguageSource.BCP)?.parent_language_id);
  const unescoParent = orUndefined(attributes.get(LanguageSource.UNESCO)?.parent_language_id);

  if (isoParent) language.ISO.parentLanguageCode = isoParent;
  if (bcpParent) language.BCP.parentLanguageCode = bcpParent;
  if (unescoParent) language.UNESCO.parentLanguageCode = unescoParent;

  return language;
}

/**
 * Rewrites `Glottolog.parentLanguageCode` from a language id to a GLOTTOCODE.
 *
 * The two paths mean different things by this field.
 * `parseLanguageLine` reads languages.tsv column 9, which is the parent's
 * GLOTTOCODE (`pbu` -> `nucl1276`), and `addGlottologLanguages` later assigns
 * `lang.Glottolog.parentLanguageCode = parentGlottocode` unconditionally - so
 * the file path holds a glottocode both before and after the merge. The ETL
 * instead resolved the same column to the parent's LANGUAGE ID (`pbu` -> `pus`)
 * when it wrote `parent_language_id`, which is the right shape for a foreign
 * key and the wrong one for this field.
 *
 * Left alone this would NOT converge - it is a lasting disagreement on 570
 * languages, not a load-time artefact - so the id is mapped back through each
 * parent's own Glottolog code here. Every parent has one: measured 26,523 of
 * 26,523, and resolving this way reconciles 7,962 of the 7,967 languages that
 * have both a glottocode and a Glottolog row.
 *
 * A second pass rather than work inside `parseApiLanguage`, because the answer
 * depends on OTHER rows and the mapper stays a pure per-row function.
 * O(n) over the rows with an O(1) lookup per parent.
 */
function resolveGlottologParents(
  languages: LanguageDictionary,
  rows: ApiLanguage[],
): LanguageDictionary {
  const glottocodeById = new Map<string, string>();
  for (const row of rows) {
    const glottolog = row.language_source_attribute.find(
      (a) => a.source === LanguageSource.Glottolog,
    );
    if (glottolog?.code != null) glottocodeById.set(row.id, glottolog.code);
  }

  for (const language of Object.values(languages)) {
    const parentId = language.Glottolog.parentLanguageCode;
    if (parentId == null) continue;
    // Falls back to the id itself, which is already a glottocode wherever the
    // parent is a Glottolog-only languoid.
    language.Glottolog.parentLanguageCode = glottocodeById.get(parentId) ?? parentId;
  }

  return languages;
}
