import { setLanguageNames } from '@entities/language/identity/setLanguageNames';
import {
  getBaseLanguageData,
  Glottocode,
  LanguageCode,
  LanguageData,
  LanguagesBySource,
  LanguageScope,
  LanguageSource,
} from '@entities/language/LanguageTypes';

const DEBUG = false;

export type GlottologData = {
  glottoCode: Glottocode;
  parentGlottocode?: Glottocode;
  name: string;
  isoCode?: LanguageCode;
  // familyGlottocode?: Glottocode;
  scope: LanguageScope;
  latitude?: number;
  longitude?: number;
};

function strToLanguageScope(str: string): LanguageScope {
  switch (str) {
    case 'dialect':
      return LanguageScope.Dialect;
    case 'family':
      return LanguageScope.Family;
    case 'language':
    default:
      return LanguageScope.Language;
  }
}

function parseGlottolog(line: string): GlottologData {
  const parts = line.split('\t');
  return {
    glottoCode: parts[0],
    parentGlottocode: parts[1] != '' ? parts[1] : undefined,
    name: parts[2],
    isoCode: parts[3] != '' ? parts[3] : undefined,
    // familyGlottocode: parts[4] != '' ? parts[4] : undefined,
    scope: strToLanguageScope(parts[5]),
    latitude: parts[6] != '' ? parseFloat(parts[6]) : undefined,
    longitude: parts[7] != '' ? parseFloat(parts[7]) : undefined,
  };
}

export async function loadGlottologLanguages(): Promise<GlottologData[] | void> {
  return await fetch('data/glottolog/glottolog.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').slice(1).map(parseGlottolog))
    .catch((err) => console.error('Error loading TSV:', err));
}

export async function loadGlottocodeToISO(): Promise<Record<Glottocode, LanguageCode> | void> {
  return await fetch('data/tc/glottocodeToISO.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').slice(1))
    .then((lines) => lines.map((line) => line.split('\t')))
    .then(Object.fromEntries)
    .catch((err) => console.error('Error loading TSV:', err));
}

/**
 *
 * languagesBySource.Glottolog is updated with new entries
 */
export function addGlottologLanguages(
  languagesBySource: LanguagesBySource,
  glottologImport: GlottologData[],
  glottocodeToISO: Record<Glottocode, LanguageCode>,
): void {
  // Add the entries from the glottocodeToISO to languagesBySource.Glottolog
  Object.entries(glottocodeToISO).forEach(([glottoCode, isoCode]) => {
    if (glottoCode === '' || glottoCode[0] === '<') {
      return; // Skip empty or invalid glottocodes
    }

    const glottolang = languagesBySource.Glottolog[glottoCode];
    const isoLang = languagesBySource.ISO[isoCode];
    if (glottolang == null && isoLang != null) {
      isoLang.Glottolog.code = glottoCode;
      languagesBySource.Glottolog[glottoCode] = isoLang;
    }
  });

  // Add new glottocodes from the import
  glottologImport.forEach((importedLanguage) => {
    const { glottoCode, parentGlottocode, scope, name, latitude, longitude } = importedLanguage;
    const lang = languagesBySource.Glottolog[glottoCode];

    if (lang == null) {
      // Create new LanguageData
      const sourceSpecific = {
        Combined: {
          code: glottoCode,
          scope,
        },
        Glottolog: {
          code: glottoCode,
          name,
          scope,
          parentLanguageCode: parentGlottocode,
        },
      };
      const newLang: LanguageData = {
        ...getBaseLanguageData(glottoCode, name),
        scope,
        viabilityConfidence: 'No',
        viabilityExplanation: 'Glottolog entry not found in ISO',
        ...sourceSpecific,
        latitude,
        longitude,
      };
      languagesBySource.Combined[glottoCode] = newLang;
      languagesBySource.Glottolog[glottoCode] = newLang;
      setLanguageNames(newLang);
    } else {
      // Fill in missing data
      if (parentGlottocode != null) {
        lang.Glottolog.parentLanguageCode = parentGlottocode;
      }
      lang.Glottolog.scope = scope;
      lang.Glottolog.name = name;
      lang.latitude = latitude;
      lang.longitude = longitude;
      if (lang.latitude != null && lang.longitude != null)
        lang.coordsSource = LanguageSource.Glottolog;

      setLanguageNames(lang);
      if (lang.scope == null) {
        lang.scope = scope;
      } else if (DEBUG && scope != lang.scope) {
        console.debug(`${glottoCode} scope is ${scope} in glottolog but ${lang.scope} in ISO`);
      }
    }
  });

  // SECOND PASS, for the Combined parent only.
  //
  // Three things are deliberate here and each one was a bug first.
  //
  // 1. A SECOND PASS, because resolving a glottocode to a languoid ID needs
  //    every node to be in the dictionary already. glottolog.tsv is sorted
  //    alphabetically and 12,931 of its 26,523 parent references name a row
  //    that appears LATER in the file, so in one pass those lookups all miss.
  //    The old code fell back to `?? parentGlottocode` and stored the raw
  //    glottocode: `cmn` got `mand1471` where the database has `zho`.
  //
  // 2. NO FALLBACK to the glottocode. Here the field is a plain string and an
  //    unresolvable value is harmless; in the database it
  //    is a FOREIGN KEY, so the same value grafts the Glottolog forest onto the
  //    Combined tree - language_ancestry 281k -> 477k. `_glottolog` therefore
  //    never writes a Combined parent at all, and this leaves it unset rather
  //    than storing an edge neither tree can follow.
  //
  // 3. `??=`, NOT `=`, matching addISOLanguageFamilyData right above it.
  //    Overwriting put `emil1243` on `rgn` where familiesToLanguages.tsv had
  //    already said `eml`, and `azte1234` on `xpo` where it had said `nah`.
  //
  // The parent is resolved through glottocodeToISO.tsv even for nodes the first
  // loop could not merge - it says `azte1234` is `nah` and `east2872` is `ekc`,
  // and the database follows it. Merging those nodes outright was tried and
  // reverted: it changes which languoids EXIST. Resolving only the parent edge
  // moves no ids.
  glottologImport.forEach(({ glottoCode, parentGlottocode }) => {
    if (parentGlottocode == null) return;
    const lang = languagesBySource.Glottolog[glottoCode];
    const parentID =
      languagesBySource.Combined[glottocodeToISO[parentGlottocode]]?.ID ??
      languagesBySource.Glottolog[parentGlottocode]?.ID;
    if (lang == null || parentID == null || parentID === lang.ID) return;
    lang.Combined.parentLanguageCode ??= parentID;
  });
}
