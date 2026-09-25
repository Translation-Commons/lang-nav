/**
 * This file provides types for the data used in the application.
 */

import { CensusData } from '@entities/census/CensusTypes';
import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { OrganizationData } from '@entities/org/OrganizationTypes';
import { OrthographyData } from '@entities/orthography/OrthographyTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { EntityType } from './EntityTypes';

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
  | OrthographyData
  | VariantData
  | KeyboardData
  | OrganizationData;

export type EntityDictionary = Record<string, EntityData>;
