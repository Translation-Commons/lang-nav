/**
 * This file provides types for the data used in the application.
 */

import { EntityType } from '@features/params/PageParamTypes';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { OrganizationData } from '@entities/org/OrganizationTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { CensusData } from '../census/CensusTypes';
import { LanguageData } from '../language/LanguageTypes';

export interface EntityBase {
  readonly type: EntityType;
  readonly ID: string; // A stable ID to use with indexing
  codeDisplay: string; // The code for the entity -- may change, like if the language schema changes
  nameDisplay: string; // The name for the entity -- may change with data from different sources
  nameEndonym?: string;
  names: string[];
}

export type EntityData =
  | CensusData
  | LanguageData
  | LocaleData
  | TerritoryData
  | WritingSystemData
  | VariantData
  | KeyboardData
  | OrganizationData;

export type EntityDictionary = Record<string, EntityData>;
