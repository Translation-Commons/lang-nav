import { separateTitleAndSubtitle } from '../generic/stringUtils';
import {
  LocaleData,
  OfficialStatus,
  PopulationSourceCategory,
  WritingSystemData,
  WritingSystemScope,
} from '../types/DataTypes';
import {
  getBaseLanguageData,
  getEmptyLanguageSourceSpecificData,
  LanguageModality,
} from '../types/LanguageTypes';
import { LanguageData } from '../types/LanguageTypes';
import { LocaleSeparator, ObjectType } from '../types/PageParamTypes';
import { getLocaleCodeFromTags, parseLocaleCode } from '../views/locale/LocaleStrings';

export function parseLanguageLine(line: string): LanguageData {
  const parts = line.split('\t');
  const nameFull = parts[2];
  const [nameDisplay, nameSubtitle] = separateTitleAndSubtitle(nameFull);
  const nameEndonym = parts[3] !== '' ? parts[3] : undefined;

  const populationAdjusted =
    parts[9] !== '' ? Number.parseInt(parts[9].replace(/,/g, '')) : undefined;
  const populationCited =
    parts[10] !== '' ? Number.parseInt(parts[10].replace(/,/g, '')) : undefined;
  const code = parts[0];
  const parentLanguageCode = parts[11] !== '' ? parts[11] : undefined;
  const parentISOCode = parts[11] !== '' && parts[11].length <= 3 ? parts[11] : undefined;
  const parentGlottocode = parts[12] !== '' ? parts[12] : undefined;

  // Initialize the data that depends on the language source
  const sourceSpecific = getEmptyLanguageSourceSpecificData();
  sourceSpecific.All = { code, name: nameDisplay, parentLanguageCode, childLanguages: [] };
  sourceSpecific.Glottolog = {
    code: parts[1] !== '' ? parts[1] : undefined,
    parentLanguageCode: parentGlottocode,
    childLanguages: [],
  };
  if (code.length <= 3) {
    sourceSpecific.ISO = { code, parentLanguageCode: parentISOCode, childLanguages: [] };
    sourceSpecific.BCP = { code, parentLanguageCode: parentISOCode, childLanguages: [] };
    // UNESCO may have different requirements
    sourceSpecific.UNESCO = {
      code,
      name: nameDisplay,
      parentLanguageCode: parentISOCode,
      childLanguages: [],
    };
  }

  return {
    ...getBaseLanguageData(code, nameDisplay),

    scope: undefined, // Added by imports

    nameCanonical: nameDisplay,
    nameDisplay,
    nameSubtitle,
    nameEndonym,
    names: [nameDisplay, nameSubtitle, nameEndonym].filter((s) => s != null),

    vitalityISO: undefined, // Added by ISO import
    vitalityEth2013: parts[6] || undefined,
    vitalityEth2025: parts[7] || undefined,
    digitalSupport: parts[8] || undefined,
    viabilityConfidence: parts[13] || undefined,
    viabilityExplanation: parts[14] || undefined,

    populationAdjusted,
    populationCited,

    modality: (parts[4] || undefined) as LanguageModality | undefined,
    primaryScriptCode: parts[5] || undefined,

    sourceSpecific,
  };
}

export function parseLocaleLine(line: string): LocaleData | null {
  const parts = line.split('\t');
  if (parts.length === 1 && parts[0] === '') {
    // Empty line, ignore
    return null;
  } else if (parts.length !== 6) {
    console.error(`Locale line not the right length, ${parts.length} parts: ${line}`);
    return null;
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
    localeSource: 'regularInput',

    nameDisplay: parts[1],
    nameEndonym: parts[2] || undefined,
    names: [parts[1], nameEndonym].filter((s) => s != null),
    languageCode,
    territoryCode,
    scriptCode,
    variantTagCodes,
    populationSource: parts[3] as PopulationSourceCategory,
    populationSpeaking: Number.parseInt(parts[4]?.replace(/,/g, '')),
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
