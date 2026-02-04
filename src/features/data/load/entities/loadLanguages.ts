import { getModalityFromLabel } from '@entities/language/LanguageModalityDisplay';
import {
  getBaseLanguageData,
  LanguageData,
  LanguageDictionary,
} from '@entities/language/LanguageTypes';
import {
  parseVitalityEthnologue2012,
  parseVitalityEthnologue2025,
} from '@entities/language/vitality/VitalityParsing';

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

  const populationAdjusted =
    parts[9] !== '' ? Number.parseInt(parts[9].replace(/,/g, '')) : undefined;
  const populationRough =
    parts[10] !== '' ? Number.parseInt(parts[10].replace(/,/g, '')) : undefined;
  const code = parts[0];
  const parentLanguageCode = parts[11] !== '' ? parts[11] : undefined;
  const parentISOCode = parts[11] !== '' && parts[11].length <= 3 ? parts[11] : undefined;
  const parentGlottocode = parts[12] !== '' ? parts[12] : undefined;
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

    vitality: {
      ethnologue2012: parseVitalityEthnologue2012(parts[6]),
      ethnologue2025: parseVitalityEthnologue2025(parts[7]),
    },
    digitalSupport: parts[8] || undefined,
    viabilityConfidence: parts[13] || undefined,
    viabilityExplanation: parts[14] || undefined,

    populationAdjusted,
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
