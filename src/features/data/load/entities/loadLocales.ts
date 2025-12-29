import { LocaleSeparator, ObjectType } from '@features/params/PageParamTypes';

import { getLocaleCodeFromTags, parseLocaleCode } from '@entities/locale/LocaleParsing';
import {
  LocaleData,
  LocaleSource,
  OfficialStatus,
  PopulationSourceCategory,
} from '@entities/types/DataTypes';

import { loadObjectsFromFile } from './loadObjectsFromFile';

export async function loadLocales(): Promise<Record<string, LocaleData> | void> {
  return await loadObjectsFromFile<LocaleData>('data/locales.tsv', parseLocaleLine);
}

export function parseLocaleLine(line: string): LocaleData | undefined {
  const parts = line.split('\t');
  if (parts.length === 1 && parts[0] === '') {
    // Empty line, ignore
    return undefined;
  } else if (parts.length !== 6) {
    console.error(`Locale line not the right length, ${parts.length} parts: ${line}`);
    return undefined;
  }
  const inputLocaleID = parts[0];
  const localeParts = parseLocaleCode(inputLocaleID);
  const { languageCode, scriptCode, territoryCode, variantTagCodes } = localeParts;
  const localeID = getLocaleCodeFromTags(localeParts, LocaleSeparator.Underscore);
  const nameEndonym = parts[2] || undefined;

  return {
    type: ObjectType.Locale,
    ID: localeID,
    codeDisplay: localeID,
    localeSource: LocaleSource.StableDatabase,

    nameDisplay: parts[1],
    nameEndonym: parts[2] || undefined,
    names: [parts[1], nameEndonym].filter((s) => s != null),
    languageCode,
    territoryCode,
    scriptCode,
    variantTagCodes,
    populationSource: parts[3] as PopulationSourceCategory,
    populationSpeaking: parts[4] !== '' ? Number.parseInt(parts[4]?.replace(/,/g, '')) : undefined,
    officialStatus: (parts[5] || undefined) as OfficialStatus | undefined,
  };
}
