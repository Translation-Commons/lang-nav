/**
 * This file provides types for the data used in the application.
 */

import type { CensusData } from '@entities/census/CensusTypes';
import type { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import type { LanguageData } from '@entities/language/LanguageTypes';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import type { OrganizationData } from '@entities/org/OrganizationTypes';
import type { TechnologyData } from '@entities/tech/TechnologyTypes';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';
import type { VariantData } from '@entities/variant/VariantTypes';
import type { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export enum EntityType {
  Language = 'Language',
  Locale = 'Locale',
  Territory = 'Territory',
  WritingSystem = 'Writing System',
  Census = 'Census',
  Variant = 'Variant',
  Keyboard = 'Keyboard',
  Org = 'Organization',
  Technology = 'Technology',
}

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
  | OrganizationData
  | TechnologyData;

export type EntityDictionary = Record<string, EntityData>;
