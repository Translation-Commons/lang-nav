/**
 * Enums and types related to orthographies
 */

import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export type LanguageOrthography = {
  scriptName: string;
  writingSystem?: WritingSystemData;
  baseCharacters?: string;
};
