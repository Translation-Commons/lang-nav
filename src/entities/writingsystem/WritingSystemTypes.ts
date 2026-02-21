/**
 * Enums and types related to writing systems
 */

import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { ObjectBase } from '@entities/types/DataTypes';

export type ScriptCode = string; // ISO 15924 script code, eg. Latn, Cyrl, etc.

export enum WritingSystemScope {
  Group = 'Group',
  IndividualScript = 'Individual script',
  Variation = 'Variation',
  SpecialCode = 'Special Code',
}

export interface WritingSystemData extends ObjectBase {
  type: ObjectType.WritingSystem;

  ID: ScriptCode;
  codeDisplay: ScriptCode; // This should be stable
  scope: WritingSystemScope;

  nameDisplay: string;
  nameDisplayOriginal?: string;
  nameFull?: string;
  nameEndonym?: string;
  names: string[];

  unicodeVersion?: number;
  sample?: string;
  rightToLeft?: boolean;
  primaryLanguageCode?: LanguageCode;
  territoryOfOriginCode?: TerritoryCode;
  parentWritingSystemCode?: ScriptCode;
  containsWritingSystemsCodes?: ScriptCode[];

  // Derived when combining data
  populationUpperBound?: number;
  populationOfDescendants?: number;

  // References to other objects, filled in after loading the TSV
  primaryLanguage?: LanguageData;
  territoryOfOrigin?: TerritoryData;
  languages?: Record<LanguageCode, LanguageData>;
  localesWhereExplicit?: LocaleData[];
  parentWritingSystem?: WritingSystemData;
  childWritingSystems?: WritingSystemData[];
  containsWritingSystems?: WritingSystemData[];
}
