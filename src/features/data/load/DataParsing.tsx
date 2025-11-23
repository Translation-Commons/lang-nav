import { LocaleSeparator, ObjectType } from '@features/params/PageParamTypes';

import { getLocaleCodeFromTags, parseLocaleCode } from '@entities/locale/LocaleStrings';
import {
  LocaleData,
  LocaleSource,
  OfficialStatus,
  PopulationSourceCategory,
  WritingSystemData,
  WritingSystemScope,
} from '@entities/types/DataTypes';

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

export function parseWritingSystem(line: string): WritingSystemData {
  const parts = line.split('\t');
  const nameEndonym = parts[3] || undefined;
  return {
    type: ObjectType.WritingSystem,

    ID: parts[0],
    codeDisplay: parts[0],
    scope: parts[11] as WritingSystemScope,
    nameDisplay: parts[1],
    nameDisplayOriginal: parts[1],
    nameFull: parts[2],
    nameEndonym,
    names: [parts[1], parts[2], nameEndonym].filter((s) => s != null),
    unicodeVersion: parts[4] !== '' ? parseFloat(parts[4]) : undefined,
    sample: parts[5] || undefined,
    rightToLeft: parts[6] === 'Yes' ? true : parts[6] === 'no' ? false : undefined,
    primaryLanguageCode: parts[7] || undefined,
    territoryOfOriginCode: parts[8] || undefined,
    parentWritingSystemCode: parts[9] || undefined,
    containsWritingSystemsCodes: parts[10] !== '' ? parts[10].split(', ') : [],
  };
}
