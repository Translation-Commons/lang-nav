import {
  getBaseLanguageData,
  LanguageData,
  LanguageDictionary,
  MAX_ISO_LANG_CODE_LENGTH,
} from '@entities/language/LanguageTypes';

import { separateTitleAndSubtitle } from '@shared/lib/stringUtils';

import { getModalityFromLabel } from '@strings/LanguageModalityStrings';

import { isApiEnabled } from '../api/apiConfig';
import { loadLanguagesFromApi } from '../api/loadLanguagesFromApi';

import { loadEntitiesFromFile } from './loadEntitiesFromFile';

/**
 * Whether the last `loadLanguages()` call actually got its data from the API,
 * as opposed to `VITE_API_URL` merely being set.
 *
 * `CoreData.tsx` reads this to decide whether to skip four of the eight
 * language files (ISO languages, macrolanguages, families, and the
 * families-to-languages map). It cannot use `isApiEnabled()` for that alone:
 * with the API on but unreachable, `loadLanguages` now falls back to
 * `languages.tsv`, which does not carry what those four files supply. Skipping
 * them in that case would leave every language quietly missing its ISO family
 * and macrolanguage data, with no error - the same trap `didTerritoryLoadFromApi`
 * exists to avoid for territory's four supplemental files.
 */
let loadedFromApi = false;

export function didLanguagesLoadFromApi(): boolean {
  return loadedFromApi;
}

export async function loadLanguages(): Promise<LanguageDictionary | void> {
  // The file path is kept, not replaced. With VITE_API_URL unset - the default,
  // and how anyone without a database runs the app - this is unchanged, and it
  // is also the side the parity test compares against.
  //
  // Falls back to the TSV file on any API failure, matching organizations,
  // writing systems and keyboards, instead of leaving the app stuck on
  // CoreData's blocking "Error loading data" alert.
  if (isApiEnabled()) {
    const fromApi = await loadLanguagesFromApi();
    if (fromApi != null) {
      loadedFromApi = true;
      return fromApi;
    }
    console.warn('Language API load failed; falling back to TSV files.');
  }
  loadedFromApi = false;
  return await loadEntitiesFromFile<LanguageData>('data/tc/languages.tsv', parseLanguageLine);
}

function parseLanguageLine(line: string): LanguageData {
  const parts = line.split('\t');
  const nameFull = parts[2];
  const [nameDisplay, nameSubtitle] = separateTitleAndSubtitle(nameFull);
  const nameEndonym = parts[3] !== '' ? parts[3] : undefined;

  const populationRough = parts[6] !== '' ? Number.parseInt(parts[6].replace(/,/g, '')) : undefined;
  const code = parts[0];
  const parentLanguageCode = parts[7] !== '' ? parts[7] : undefined;
  const parentISOCode = parts[7] !== '' && parts[7].length <= 3 ? parts[7] : undefined;
  const parentGlottocode = parts[8] !== '' ? parts[8] : undefined;
  // Convert strings to the numeric enum
  const modality = getModalityFromLabel(parts[4]);

  const language = {
    ...getBaseLanguageData(code, nameDisplay),

    scope: undefined, // Added by imports

    nameCanonical: nameDisplay,
    nameDisplay,
    nameSubtitle,
    nameEndonym,
    names: [nameDisplay, nameEndonym].filter((s) => s != null),

    vitality: {}, // Filled in later
    viabilityConfidence: parts[9] || undefined,
    viabilityExplanation: parts[10] || undefined,

    modality,
    primaryScriptCode: parts[5] || undefined,
    Combined: { code, name: nameDisplay, parentLanguageCode },
    Glottolog: {
      code: parts[1] !== '' ? parts[1] : undefined,
      parentLanguageCode: parentGlottocode,
    },
  };
  language.pop.rough = populationRough;

  // TWO conditions, not one. The parent must be short enough to be an ISO code
  // AND the languoid must be in those three sources at all.
  //
  // Six rows in languages.tsv are keyed by GLOTTOCODE and still name a 3-letter
  // parent in column 8 - `chan1329` -> `hnm`, `coas1318` -> `zho`, and the four
  // Min varieties beside them. Testing only the parent gave those an ISO, BCP
  // and UNESCO parent while they have no code in any of the three, so the edge
  // pointed into a tree its own node was not part of. The database declines to
  // write those rows for the same reason (backend/etl/loaders/languages.py
  // guards on the languoid's own id length), and a parent without a node is
  // exactly the dangling edge that breaks a per-source hierarchy.
  if (parentISOCode && code.length <= MAX_ISO_LANG_CODE_LENGTH) {
    language.ISO.parentLanguageCode = parentISOCode;
    language.BCP.parentLanguageCode = parentISOCode;
    language.UNESCO.parentLanguageCode = parentISOCode;
  }
  // if (code.length <= 3) {
  //   language.ISO = { code, parentLanguageCode: parentISOCode };
  //   language.BCP = { code, parentLanguageCode: parentISOCode };
  //   // UNESCO may have different requirements
  //   language.UNESCO = {
  //     code,
  //     name: nameDisplay,
  //     parentLanguageCode: parentISOCode,
  //   };
  // }

  return language;
}
