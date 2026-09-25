/**
 * Enums and types related to orthographies
 */

import { LanguageData } from '@entities/language/LanguageTypes';
import { EntityBase } from '@entities/types/DataTypes';
import { EntityType } from '@entities/types/EntityTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export type OrthographyDictionary = Record<string, OrthographyData>;

export type OrthographyData = EntityBase & {
  type: EntityType.Orthography;

  baseCharacters?: string;

  // Connections
  languageCode: string;
  scriptName: string;
  language?: LanguageData;
  writingSystem?: WritingSystemData;
};
