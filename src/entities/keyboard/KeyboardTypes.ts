/**
 * Enums and types related to keyboards
 */

import type { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import type { TechnologyData } from '@entities/tech/TechnologyTypes';
import type { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import type { EntityBase, EntityType } from '@entities/types/EntityTypes';
import type { VariantData } from '@entities/variant/VariantTypes';
import type { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export type KeyboardDictionary = Record<string, KeyboardData>;

export enum KeyboardPlatform {
  GBoard = 'GBoard',
  Keyman = 'Keyman',
}

export interface KeyboardData extends EntityBase {
  type: EntityType.Keyboard;

  // From TSV
  ID: string; // eg. gboard_ahr_Deva_t_k0_Latn
  codeDisplay: string;
  nameDisplay: string; // eg. "Ahirani, Transliteration"
  names: string[];
  inputTechCode: string; // GBoard, Keyman
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
  inputTech?: TechnologyData; // GBoard, Keyman
}
