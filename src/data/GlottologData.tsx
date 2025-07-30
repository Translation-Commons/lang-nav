import {
  Glottocode,
  LanguageCode,
  LanguageData,
  LanguagesBySource,
  LanguageScope,
} from '../types/LanguageTypes';
import { ObjectType } from '../types/PageParamTypes';

const DEBUG = false;

export type GlottologData = {
  glottoCode: Glottocode;
  parentGlottocode?: Glottocode;
  name: string;
  isoCode?: LanguageCode;
  // familyGlottocode?: Glottocode;
  scope: LanguageScope;
  // latitude?: number;
  // longitude?: number;
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
    // latitude: parts[6] != '' ? parseFloat(parts[6]) : undefined,
    // longitude: parts[7] != '' ? parseFloat(parts[7]) : undefined,
  };
}

export async function loadGlottologLanguages(): Promise<GlottologData[] | void> {
  return await fetch('data/glottolog.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').slice(1).map(parseGlottolog))
    .catch((err) => console.error('Error loading TSV:', err));
}

export async function loadManualGlottocodeToISO(): Promise<Record<
  Glottocode,
  LanguageCode
> | void> {
  return await fetch('data/iso/manualGlottocodeToISO.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1)
        .map((line) => line.split('\t')),
    )
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
  manualGlottocodeToISO: Record<Glottocode, LanguageCode>,
): void {
  // Add the entries from the manualGlottocodeToISO to languagesBySource.Glottolog
  Object.entries(manualGlottocodeToISO).forEach(([glottoCode, isoCode]) => {
    if (glottoCode === '' || glottoCode[0] === '<') {
      return; // Skip empty or invalid glottocodes
    }

    const glottolang = languagesBySource.Glottolog[glottoCode];
    const isoLang = languagesBySource.ISO[isoCode];
    if (glottolang == null && isoLang != null) {
      isoLang.sourceSpecific.Glottolog.code = glottoCode;
      languagesBySource.Glottolog[glottoCode] = isoLang;
    }
  });

  // Add new glottocodes from the import
  glottologImport.forEach((importedLanguage) => {
    const { glottoCode, parentGlottocode, scope, name } = importedLanguage;
    const lang = languagesBySource.Glottolog[glottoCode];
    const parentLanguageCode =
      parentGlottocode != null ? languagesBySource.Glottolog[parentGlottocode]?.ID : undefined;

    if (lang == null) {
      // Create new LanguageData
      const sourceSpecific = {
        All: {
          code: glottoCode,
          scope,
          parentLanguageCode: parentLanguageCode ?? parentGlottocode,
          childLanguages: [],
        },
        ISO: { childLanguages: [] },
        UNESCO: { childLanguages: [] },
        Glottolog: {
          code: glottoCode,
          name,
          scope,
          parentLanguageCode: parentGlottocode,
          childLanguages: [],
        },
        CLDR: { childLanguages: [] },
      };
      const newLang: LanguageData = {
        type: ObjectType.Language,
        ID: glottoCode,
        codeDisplay: glottoCode,
        nameCanonical: name,
        nameDisplay: name,
        names: [name],
        scope,
        viabilityConfidence: 'No',
        viabilityExplanation: 'Glottolog entry not found in ISO',
        sourceSpecific,
        writingSystems: {},
        locales: [],
        childLanguages: [],
      };
      languagesBySource.All[glottoCode] = newLang;
      languagesBySource.Glottolog[glottoCode] = newLang;
    } else {
      // Fill in missing data
      if (parentGlottocode != null) {
        lang.sourceSpecific.All.parentLanguageCode = parentLanguageCode ?? parentGlottocode; // Prefer original parentage
        lang.sourceSpecific.Glottolog.parentLanguageCode = parentGlottocode;
      }
      lang.sourceSpecific.Glottolog.scope = scope;
      lang.sourceSpecific.Glottolog.name = name;
      if (lang.scope == null) {
        lang.scope = scope;
      } else if (DEBUG && scope != lang.scope) {
        console.log(`${glottoCode} scope is ${scope} in glottolog but ${lang.scope} in ISO`);
      }
    }
  });
}
