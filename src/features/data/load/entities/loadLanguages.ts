import { getModalityFromLabel } from '@entities/language/LanguageModalityDisplay';
import {
  getBaseLanguageData,
  LanguageData,
  LanguageDictionary,
} from '@entities/language/LanguageTypes';

import { separateTitleAndSubtitle } from '@shared/lib/stringUtils';

import { loadObjectsFromFile } from './loadObjectsFromFile';

export async function loadLanguages(): Promise<LanguageDictionary | void> {
  return await loadObjectsFromFile<LanguageData>('data/languages.tsv', parseLanguageLine);
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
    viabilityConfidence: parts[13] || undefined,
    viabilityExplanation: parts[14] || undefined,

    populationRough,

    modality,
    primaryScriptCode: parts[5] || undefined,
    Combined: { code, name: nameDisplay, parentLanguageCode },
    Glottolog: {
      code: parts[1] !== '' ? parts[1] : undefined,
      parentLanguageCode: parentGlottocode,
    },
  };

  if (code.length <= 3) {
    language.ISO = { code, parentLanguageCode: parentISOCode };
    language.BCP = { code, parentLanguageCode: parentISOCode };
    // UNESCO may have different requirements
    language.UNESCO = {
      code,
      name: nameDisplay,
      parentLanguageCode: parentISOCode,
    };
  }

  return language;
}
