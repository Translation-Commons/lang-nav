// export function loadEthnologue2025Data(): LanguageDataLoader {

import {
  EthnologueDigitalSupport,
  EthnologueLanguageData,
  LanguageCode,
  LanguageData,
  LanguageDictionary,
} from '@entities/language/LanguageTypes';
import {
  parseVitalityEthnologue2012,
  parseVitalityEthnologue2025,
} from '@entities/language/vitality/VitalityParsing';
import { VitalityEthnologueCoarse } from '@entities/language/vitality/VitalityTypes';

export async function loadEthnologueLanguages(): Promise<EthnologueLanguageData[] | void> {
  return await fetch('data/sil/ethnologue2025.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1)
        .filter((line) => line.trim() !== ''),
    )
    .then((lines) =>
      lines.map((line: string) => {
        const parts = line.split('\t');
        // Columns: ISO Code	Language Name	Population Size	Vitality	Digital Support
        const vitality = parseVitalityEthnologue2025(parts[3]);
        return {
          code: parts[0],
          name: parts[1],
          population: parsePopulationSize(parts[2], vitality),
          vitality2012: undefined, // it comes from a different file
          vitality2025: vitality,
          digitalSupport: parseDigitalSupport(parts[4]),
        };
      }),
    );
}

function parsePopulationSize(
  sizeStr: string,
  vitality?: VitalityEthnologueCoarse,
): number | undefined {
  switch (sizeStr.trim()) {
    case 'None':
      // Some non-extinct languages have a population of "None" which looks like a data error so those
      // are dropped
      return vitality === VitalityEthnologueCoarse.Extinct ? 0 : undefined;
    case 'Less than 10K':
      return 1;
    case '10K to 1M':
      return 10000;
    case '1M to 1B':
      return 1e6;
    case 'More than 1B':
      return 1e9;
    case '':
      return undefined;
  }
  console.debug(`Unknown population size string: ${sizeStr}`);
  return undefined;
}

function parseDigitalSupport(digitalSupport: string): EthnologueDigitalSupport | undefined {
  if (!digitalSupport) return undefined;

  switch (digitalSupport.trim().toLowerCase()) {
    case 'thriving':
      return EthnologueDigitalSupport.Thriving;
    case 'vital':
      return EthnologueDigitalSupport.Vital;
    case 'ascending':
      return EthnologueDigitalSupport.Ascending;
    case 'emerging':
      return EthnologueDigitalSupport.Emerging;
    case 'still':
      return EthnologueDigitalSupport.Still;
    default:
      console.debug(`Unknown digital support string: ${digitalSupport}`);
      return undefined;
  }
}

export function addEthnologueDataToLanguages(
  languages: LanguageDictionary,
  ethnologueData: EthnologueLanguageData[],
): void {
  ethnologueData.forEach((ethLang) => {
    const lang = languages[ethLang.code!];
    if (lang != null) {
      lang.Ethnologue = ethLang;
    } else {
      console.debug(`No language found for Ethnologue entry ${ethLang.name} [${ethLang.code}]`);
    }
  });
}

export async function loadEthnologue2012Data(
  getLanguage: (code: LanguageCode) => LanguageData | undefined,
): Promise<void> {
  await fetch('data/sil/ethnologue2012.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1)
        .filter((line) => line.trim() !== ''),
    )
    .then((lines) =>
      lines.map((line: string) => {
        const parts = line.split('\t');
        // Columns: unique_join_code	Eth_Language Status
        const lang = getLanguage(parts[0]);
        if (lang != null) {
          lang.Ethnologue.vitality2012 =
            parts[1] !== '' ? parseVitalityEthnologue2012(parts[1]) : undefined;
        } else if (parts[1].trim() !== '7.7') {
          // vitality "7.7" was given to data not in the Ethnologue dataset
          console.debug(`No language found for Ethnologue 2012 entry ${parts[0]}, ${parts[1]}`);
        }
      }),
    );
}
