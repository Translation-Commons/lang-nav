/**
 * Enums and types related to orthographies
 */

import { LanguageData } from '@entities/language/LanguageTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export type Orthography = {
  languageCode: string;
  language?: LanguageData;
  scriptName: string;
  writingSystem?: WritingSystemData;
  baseCharacters?: string;
};
