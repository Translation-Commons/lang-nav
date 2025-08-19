import { separateTitleAndSubtitle } from '../generic/stringUtils';
import {
  LocaleData,
  OfficialStatus,
  PopulationSourceCategory,
  WritingSystemData,
  WritingSystemScope,
} from '../types/DataTypes';
import { getBaseLanguageData, LanguageModality } from '../types/LanguageTypes';
import { LanguageData } from '../types/LanguageTypes';
import { ObjectType } from '../types/PageParamTypes';

export function parseLanguageLine(line: string): LanguageData {
  const parts = line.split('\t');
  const nameFull = parts[2];
  const [nameDisplay, nameSubtitle] = separateTitleAndSubtitle(nameFull);
  const populationAdjusted =
    parts[9] != '' ? Number.parseInt(parts[9].replace(/,/g, '')) : undefined;
  const populationCited =
    parts[10] != '' ? Number.parseInt(parts[10].replace(/,/g, '')) : undefined;
  const code = parts[0];
  const parentLanguageCode = parts[11] != '' ? parts[11] : undefined;
  const parentISOCode = parts[11] != '' && parts[11].length <= 3 ? parts[11] : undefined;
  const parentGlottocode = parts[12] != '' ? parts[12] : undefined;
  const sourceSpecific = {
    All: { code, name: nameDisplay, parentLanguageCode, childLanguages: [] },
    ISO: { code, parentLanguageCode: parentISOCode, childLanguages: [] },
    BCP: { code, parentLanguageCode: parentISOCode, childLanguages: [] },
    UNESCO: { code, name: nameDisplay, parentLanguageCode: parentISOCode, childLanguages: [] },
    Glottolog: {
      code: parts[1] != '' ? parts[1] : undefined,
      parentLanguageCode: parentGlottocode,
      childLanguages: [],
    },
    CLDR: { childLanguages: [] }, 
  };
  const nameEndonym = parts[3] != '' ? parts[3] : undefined;

  return {
    ...getBaseLanguageData(code, nameDisplay),

    scope: undefined, 

    nameCanonical: nameDisplay,
    nameDisplay,
    nameSubtitle,
    nameEndonym,
    names: [nameDisplay, nameSubtitle, nameEndonym].filter((s) => s != null),

    vitalityISO: undefined,
    vitalityEth2013: parts[6] != '' ? parts[6] : undefined,
    vitalityEth2025: parts[7] != '' ? parts[7] : undefined,
    digitalSupport: parts[8] != '' ? parts[8] : undefined,
    viabilityConfidence: parts[13] != '' ? parts[13] : 'No',
    viabilityExplanation: parts[14] != '' ? parts[14] : undefined,

    populationAdjusted,
    populationCited,

    modality: parts[4] !== '' ? (parts[4] as LanguageModality) : undefined,
    primaryScriptCode: parts[5] != '' ? parts[5] : undefined,

    sourceSpecific,
  };
}

export function parseLocaleLine(line: string): LocaleData {
  const parts = line.split('\t');
  const nameEndonym = parts[2] != '' ? parts[2] : undefined;

  const variantTagCodesRaw = parts[6] != '' ? parts[6].toLowerCase() : undefined;
  const variantTagCodes = variantTagCodesRaw
    ? variantTagCodesRaw.split('-').filter((v) => v.length > 0)
    : undefined;

  return {
    type: ObjectType.Locale,
    ID: parts[0],
    codeDisplay: parts[0],
    localeSource: 'regularInput',

    nameDisplay: parts[1],
    nameEndonym: parts[2] != '' ? parts[2] : undefined,
    names: [parts[1], nameEndonym].filter((s) => s != null),
    languageCode: parts[3],
    territoryCode: parts[4],
    explicitScriptCode: parts[5] != '' ? parts[5] : undefined,
    variantTagCodes,
    populationSource: parts[7] as PopulationSourceCategory,
    populationSpeaking: Number.parseInt(parts[8]?.replace(/,/g, '')),
    officialStatus: parts[9] != '' ? (parts[9] as OfficialStatus) : undefined,

    censusRecords: [],
  };
}

export function parseWritingSystem(line: string): WritingSystemData {
  const parts = line.split('\t');
  const nameEndonym = parts[3] != '' ? parts[3] : undefined;
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
    unicodeVersion: parts[4] != '' ? parseFloat(parts[4]) : null,
    sample: parts[5] != '' ? parts[5] : null,
    rightToLeft: parts[6] === 'Yes' ? true : parts[6] === 'no' ? false : null,
    primaryLanguageCode: parts[7] != '' ? parts[7] : null,
    territoryOfOriginCode: parts[8] != '' ? parts[8] : null,
    parentWritingSystemCode: parts[9] != '' ? parts[9] : null,
    containsWritingSystemsCodes: parts[10] != '' ? parts[10].split(', ') : [],

    populationUpperBound: 0,
    populationOfDescendents: 0,

    languages: {},
    localesWhereExplicit: [],
    primaryLanguage: undefined,
    territoryOfOrigin: undefined,
    parentWritingSystem: undefined,
    childWritingSystems: [],
    containsWritingSystems: [],
  };
}
