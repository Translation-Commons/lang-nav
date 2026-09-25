/**
 * Enums and types related to orthographies
 */

import { EntityType } from '@features/params/PageParamTypes';

import { LanguageData } from '@entities/language/LanguageTypes';
import { EntityBase } from '@entities/types/DataTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export type OrthographyDictionary = Record<string, Orthography>;
export type Orthography = EntityBase & {
  type: EntityType.Orthography;
  languageCode: string;
  language?: LanguageData;
  scriptName: string;
  writingSystem?: WritingSystemData;
  baseCharacters?: string;
};
