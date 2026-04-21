import { ObjectType } from '@features/params/PageParamTypes';

import { CensusData } from '@entities/census/CensusTypes';
import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { ObjectData } from '@entities/types/DataTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export function getLanguageForEntity(object: ObjectData | undefined): LanguageData | undefined {
  if (!object) return undefined;
  if (object.type === ObjectType.Language) return object;
  if (object.type === ObjectType.Locale) return object.language;
  return undefined;
}

export function getWritingSystemForEntity(
  object: ObjectData | undefined,
): WritingSystemData | undefined {
  if (!object) return undefined;
  if (object.type === ObjectType.WritingSystem) return object;
  if (object.type === ObjectType.Locale) return object.writingSystem;
  if (object.type === ObjectType.Keyboard) return object.inputWritingSystem;
  return undefined;
}

export function getTerritoryForEntity(object: ObjectData | undefined): TerritoryData | undefined {
  if (!object) return undefined;
  if (object.type === ObjectType.Territory) return object;
  if (object.type === ObjectType.Locale) return object.territory;
  if (object.type === ObjectType.Census) return object.territory;
  if (object.type === ObjectType.Keyboard) return object.territory;
  return undefined;
}

export function getCensusForEntity(object: ObjectData | undefined): CensusData | undefined {
  if (!object) return undefined;
  if (object.type === ObjectType.Census) return object;
  if (object.type === ObjectType.Locale) return object.populationCensus;
  return undefined;
}

export function getKeyboardForEntity(object: ObjectData | undefined): KeyboardData | undefined {
  if (!object) return undefined;
  if (object.type === ObjectType.Keyboard) return object;
  return undefined;
}
