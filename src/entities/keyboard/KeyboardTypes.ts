/**
 * Enums and types related to keyboards
 */
import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { ObjectBase } from '@entities/types/DataTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export enum KeyboardPlatform {
  GBoard = 'GBoard',
  Keyman = 'Keyman',
}

export type KeyboardDictionary = Record<string, KeyboardData>;

export interface KeyboardData extends ObjectBase {
  type: ObjectType.Keyboard;

  // From TSV
  ID: string;
  codeDisplay: string;
  nameDisplay: string;
  names: string[];
  platform: KeyboardPlatform;
  languageCodes: LanguageCode[]; // GBoard: always 1 element, Keyman: 1 or more
  territoryCode?: TerritoryCode;
  inputScriptCode: ScriptCode;
  outputScriptCode: ScriptCode;
  variantCode?: string;

  // Keyman only
  downloads?: number;
  totalDownloads?: number;
  platformSupport?: string[]; // e.g. ["windows", "macos", "ios"]

  // Computed after loading
  languages?: LanguageData[]; // resolved from languageCodes
  territory?: TerritoryData;
  inputWritingSystem?: WritingSystemData;
  outputWritingSystem?: WritingSystemData;
  variant?: VariantData;
  locales?: LocaleData[];
}
