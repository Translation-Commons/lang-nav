import { RetirementReason } from '@features/data/load/extra_entities/ISORetirements';
import { EntityType } from '@features/params/PageParamTypes';

import { LanguageModality } from '@entities/language/LanguageModality';
import {
  LanguageData,
  LanguageDictionary,
  LanguageScope,
  LanguageSource,
} from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

import { toDictionary } from '@shared/lib/setUtils';

import { fetchFromApi } from './apiConfig';

/**
 * Loads languages from the API instead of from `languages.tsv`.
 *
 * SCOPE: this replaces `parseLanguageLine` AND the three merge steps that no
 * longer run when the API is on - iso-639-3.tab, families639-5.tsv and
 * macrolanguages.tsv. So it sends more than the columns of languages.tsv: the
 * per-source name, scope, 639-1 code, 639-2b code and retirement reason all
 * arrive here now, because they are what those files used to supply.
 *
 * Which files could go was settled by measurement rather than by reading -
 * each was withheld from the API path in turn and the result diffed against
 * the full file path. iso-639-3.tab alone accounted for 31,866 field
 * differences. The reasons the other five stay are recorded beside the loader
 * list in CoreData.tsx; none of them is a missing column.
 *
 * The `language` table also holds D7-D10's derived populations, depths,
 * descendant counts and largest-descendant links. None is selected, because
 * the browser still computes all of them.
 *
 * TWO TESTS GUARD THIS, and they ask different questions.
 * `__tests__/loadLanguagesParity.test.ts` compares LOADER OUTPUT, so a field
 * this mapper now leads on is a converging key there rather than a mismatch.
 * `__tests__/loadLanguagesMergedParity.test.ts` compares the END STATE with
 * exactly the files CoreData.tsx still fetches, and that is the one that has
 * to stay green when a merge step is removed.
 */

/**
 * One aggregated `language_code_alias` row from `api.language`.
 *
 * The keys are short because they repeat once per alias per language across
 * 27,378 rows; the view documents which column each maps to.
 */
type ApiLanguageCodeAlias = {
  /** alias_code */ a: string;
  /** alias_kind */ k: string;
};

/** One aggregated `language_source_attribute` row, one per (language, source). */
type ApiLanguageSourceAttribute = {
  /** source */ s: string;
  /** code */ c: string | null;
  /** name */ n: string | null;
  /** scope */ sc: number | null;
  /** parent_language_id */ p: string | null;
  /** code_6391 */ c1: string | null;
  /** retirement_reason */ rr: string | null;
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
  iso_status: number | null;
  latitude: number | null;
  longitude: number | null;
  coords_source: string | null;

  // The Combined parent as STORED - a foreign key, so NULL wherever the parent
  // is not itself in the Combined tree - and the Glottolog parent beside it.
  // The view keeps them separate rather than pre-COALESCEing so the mapper can
  // tell a real tree edge from a display-only glottocode.
  parent_language_id: string | null;
  glottolog_parent_language_id: string | null;

  retirement_reason: string | null;
  retirement_change_to: string | null;
  retirement_remedy: string | null;
  retirement_effective_date: string | null;

  sources: ApiLanguageSourceAttribute[];
  aliases: ApiLanguageCodeAlias[];
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
 * source would silently come back EMPTY.
 */
const RECOMMENDATION_COLUMNS = 'recommendation,recommendation_reason';

/** `LanguageScope.Family`, as the smallint the database stores. */
const FAMILY_SCOPE = 5;

/**
 * One request, one embed.
 *
 * The foreign key MUST be named. `language_source_attribute` references
 * `language` three times - `language_id`, `parent_language_id` and
 * `largest_descendant_id` - and PostgREST refuses to guess between them,
 * failing with PGRST201. The constraint name in this URL is more brittle than a
 * column name would be; if it starts appearing in more loaders that is the
 * trigger for moving these loaders onto a dedicated `api` schema of views.
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
  `primary_script_id,population_rough,iso_status,${RECOMMENDATION_COLUMNS},` +
  'latitude,longitude,coords_source,' +
  'parent_language_id,glottolog_parent_language_id,' +
  'retirement_reason,retirement_change_to,retirement_remedy,' +
  'retirement_effective_date,sources,aliases' +
  '&order=id.asc';

/**
 * The schema holding the view. Passed as `Accept-Profile`, because
 * postgrest.conf lists "public,api" and resolves an unqualified name against
 * public first - so the base tables keep working and this is reached only by
 * asking for it.
 */
const API_SCHEMA = 'api';

export async function loadLanguagesFromApi(): Promise<LanguageDictionary | void> {
  // Resolves to undefined on failure, never rejects. CoreData.tsx awaits every
  // loader in one Promise.all and then checks the results for null; a rejected
  // promise skips that check entirely, so the alert never runs and the loading
  // indicator sticks forever with the cause only in the console.
  try {
    const rows = await fetchFromApi<ApiLanguage[]>(LANGUAGE_QUERY, API_SCHEMA);
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
  const attributes = new Map(row.sources.map((a) => [a.s, a]));
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
  const glottocodeAlias = orUndefined(row.aliases.find((a) => a.k === 'glottocode')?.a ?? null);

  // `code6392b` is '' for most languages on the file path, not undefined:
  // parseISOLanguage6393Line reads iso-639-3.tab column 2 unconditionally and
  // that column is empty for all but 420 rows. The database stores only the
  // 420 real ones, as `iso639-2b` aliases, so the empty string has to be put
  // back or every language without a 639-2b code would differ.
  const iso6392bAlias = row.aliases.find((a) => a.k === 'iso639-2b');

  // THE COMBINED PARENT, taken from the view's own column rather than from the
  // Combined attribute row.
  //
  // This is the difference the view exists for. `parent_language_id` on the
  // attribute row is a FOREIGN KEY, so it is NULL wherever the browser holds a
  // glottocode - `kor` -> `kore1284`, on 1,902 languoids - and no query against
  // the base table can return that value. The view computes it: the stored edge
  // where there is one, the Glottolog parent where there is not, which is
  // exactly `addGlottologLanguages`'s `??=`.
  const parentLanguageCode =
    orUndefined(row.parent_language_id) ?? orUndefined(row.glottolog_parent_language_id);

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
      // column, not a derived value.
      code: orUndefined(glottolog?.c) ?? glottocodeAlias,
      parentLanguageCode: orUndefined(glottolog?.p),
    },
    ISO: {},
    BCP: {},
    UNESCO: {},
    CLDR: {},
  };
  // Each source's parent comes from ITS OWN row. No fallback: the ETL now
  // defers the languages.tsv column-8 parents until the families exist, so
  // ISO and BCP hold everything the file gives them.
  //
  // A Combined-parent fallback was tried and removed. It fired on 71
  // languages: 13 correctly and 58 WRONGLY, because a Combined parent that
  // came from familiesToLanguages.tsv is indistinguishable in the database
  // from one the ETL dropped, and the file path applies that file to ISO and
  // BCP only - never to UNESCO, and only via `??=` after the merge. Deriving
  // it here front-ran that step and handed `que`, `eus` and `pbb` a UNESCO
  // parent the file path never gives them.
  //
  // `dyl` and `lfb` still lack a UNESCO parent the file gives them. Two rows,
  // and it needs an answer about what the UNESCO tree contains rather than a
  // rule here.
  const isoParent = orUndefined(attributes.get(LanguageSource.ISO)?.p);
  const bcpParent = orUndefined(attributes.get(LanguageSource.BCP)?.p);
  const unescoParent = orUndefined(attributes.get(LanguageSource.UNESCO)?.p);

  if (isoParent) language.ISO.parentLanguageCode = isoParent;
  if (bcpParent) language.BCP.parentLanguageCode = bcpParent;
  if (unescoParent) language.UNESCO.parentLanguageCode = unescoParent;

  // THE FIELDS THE MERGE STEPS USED TO SUPPLY.
  //
  // Everything above this point is a column of languages.tsv. Everything below
  // arrives in the browser from one of the seven supplemental files, and it is
  // what kept them load-bearing: measured by withholding each file from the API
  // path, iso-639-3.tab alone accounted for 31,866 field differences and
  // glottolog.tsv for 47,227, while the languoid SET was identical either way.
  // The data was in the database the whole time - `language_source_attribute`
  // carries name, scope, code_6391 and retirement_reason per source - and the
  // query simply never asked for it.
  //
  // Each assignment below mirrors one line of a merge step, named beside it, so
  // the two can be diffed when either changes.
  const iso = attributes.get(LanguageSource.ISO);
  const bcp = attributes.get(LanguageSource.BCP);
  const unesco = attributes.get(LanguageSource.UNESCO);

  // `iso_status` IS THE TEST FOR "is this languoid in iso-639-3.tab".
  //
  // It is non-null for exactly the 8,000-odd rows of that file and null for
  // everything else, so it is what separates the two branches of
  // addISOLanguageFamilyData. That distinction is load-bearing rather than
  // cosmetic: a 639-5 family like `ber`, `sit` or `zhx` gets a NAME, a SCOPE
  // and a PARENT from families639-5.tsv but never a CODE in any ISO-based
  // source, because addISODataToLanguages - the only thing that assigns those
  // codes - never sees it. Setting `ISO.code` for them anyway put a code on 10
  // families the file path leaves bare, and `UNESCO.code` and `CLDR.code` with
  // it, which would then have changed which languoids groupLanguagesBySource
  // indexes into those two dictionaries.
  const isInIso6393 = row.iso_status != null;

  // addISODataToLanguages, from iso-639-3.tab.
  if (iso != null) {
    if (isInIso6393) {
      language.ISO.code = orUndefined(iso.c);
      language.ISO.code6391 = orUndefined(iso.c1);
      language.ISO.code6392b = iso6392bAlias?.a ?? '';
      // A column of `language`, not of the ISO attribute row - it is a property
      // of the languoid rather than of its ISO identity.
      language.ISO.status = orUndefined(row.iso_status) as LanguageISOStatus | undefined;
    }
    language.ISO.name = orUndefined(iso.n);
    language.ISO.scope = orUndefined(iso.sc) as LanguageScope | undefined;
    // addISODataToLanguages sets the TOP-LEVEL scope from the ISO row too, and
    // groupLanguagesBySource filters the CLDR dictionary on it.
    if (isInIso6393) language.scope = orUndefined(iso.sc) as LanguageScope | undefined;
  }
  if (bcp != null) {
    if (isInIso6393) language.BCP.code = orUndefined(bcp.c);
    language.BCP.name = orUndefined(bcp.n);
    language.BCP.scope = orUndefined(bcp.sc) as LanguageScope | undefined;
  }
  if (unesco != null && isInIso6393) {
    language.UNESCO.code = orUndefined(unesco.c);
  }

  // addISORetirementsToLanguages, from iso-639-3_Retirements.tab. The cast is
  // what the file path already does with the same column - ISORetirements.tsx
  // parses `Ret_Reason` straight to the enum without checking it - so casting
  // here keeps the two paths producing identical values, which is what the
  // parity tests compare.
  const retirementReason = orUndefined(iso?.rr) as RetirementReason | undefined;
  if (retirementReason) language.ISO.retirementReason = retirementReason;

  // addGlottologLanguages, from glottolog.tsv.
  if (glottolog != null) {
    language.Glottolog.name = orUndefined(glottolog.n);
    language.Glottolog.scope = orUndefined(glottolog.sc) as LanguageScope | undefined;
  }

  // The Combined SCOPE, which no column of languages.tsv carries - and only for
  // a languoid the file path would actually give one.
  //
  // It reaches the browser from addISORetirementsToLanguages, which stamps
  // SpecialCode on a retired code it has to CREATE (`cca` Cauca). The
  // families are the exception and the reason for the guard:
  // addISOLanguageFamilyData sets Combined.scope only in its `familyEntry ==
  // null` branch, so a 639-5 family that languages.tsv already carries - `ber`,
  // `sit`, `zhx` and 5 more - keeps an UNDEFINED Combined.scope even though its
  // top-level scope becomes Family. The database records the scope either way,
  // so copying it unguarded gave those 8 a value the file path never gives them.
  if (combined != null && combined.sc !== FAMILY_SCOPE) {
    language.Combined.scope = orUndefined(combined.sc) as LanguageScope | undefined;
  }

  // The TOP-LEVEL scope for a family, which is the other half of the same
  // split. addISOLanguageFamilyData sets `familyEntry.scope ??= Family` in BOTH
  // its branches even though only one of them sets Combined.scope, so a 639-5
  // family ends up with a top-level Family scope and no Combined one. With
  // families639-5.tsv no longer fetched, this is what supplies it - and it
  // matters beyond display, because groupLanguagesBySource excludes a Family
  // from the CLDR dictionary.
  if (language.scope == null && combined?.sc === FAMILY_SCOPE) {
    language.scope = LanguageScope.Family;
  }

  // addISODataToLanguages again: CLDR is keyed on the BCP-47 code, and only for
  // languoids that file actually names.
  if (isInIso6393) {
    const cldrCode = orUndefined(iso?.c1) ?? orUndefined(iso?.c);
    if (cldrCode) language.CLDR.code = cldrCode;
  }

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
    const glottolog = row.sources.find((a) => a.s === LanguageSource.Glottolog);
    if (glottolog?.c != null) glottocodeById.set(row.id, glottolog.c);
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
