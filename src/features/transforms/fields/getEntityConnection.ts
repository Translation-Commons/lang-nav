import { EntityType } from '@features/params/PageParamTypes';

import { CensusData } from '@entities/census/CensusTypes';
import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { uniqueBy } from '@shared/lib/setUtils';

export function getLanguageForEntity(ent: EntityData | undefined): LanguageData | undefined {
  if (!ent) return undefined;
  if (ent.type === EntityType.Language) return ent;
  if (ent.type === EntityType.Locale) return ent.language;
  return undefined;
}

export function getWritingSystemForEntity(
  ent: EntityData | undefined,
): WritingSystemData | undefined {
  if (!ent) return undefined;
  if (ent.type === EntityType.WritingSystem) return ent;
  if (ent.type === EntityType.Locale) return ent.writingSystem;
  if (ent.type === EntityType.Keyboard) return ent.inputWritingSystem;
  return undefined;
}

export function getTerritoryForEntity(ent: EntityData | undefined): TerritoryData | undefined {
  if (!ent) return undefined;
  if (ent.type === EntityType.Territory) return ent;
  if (ent.type === EntityType.Locale) return ent.territory;
  if (ent.type === EntityType.Census) return ent.territory;
  if (ent.type === EntityType.Keyboard) return ent.territory;
  return undefined;
}

export function getCensusForEntity(ent: EntityData | undefined): CensusData | undefined {
  if (!ent) return undefined;
  if (ent.type === EntityType.Census) return ent;
  if (ent.type === EntityType.Locale) return ent.pop.speaking.census;
  return undefined;
}

export function getKeyboardForEntity(ent: EntityData | undefined): KeyboardData | undefined {
  if (!ent) return undefined;
  if (ent.type === EntityType.Keyboard) return ent;
  return undefined;
}

export function getVariantsForEntity(ent: EntityData | undefined): VariantData[] | undefined {
  if (!ent) return undefined;
  if (ent.type === EntityType.Variant) return [ent];
  if (ent.type === EntityType.Keyboard) return ent.variant ? [ent.variant] : undefined;
  if (ent.type === EntityType.Locale && ent.variants) return ent.variants;
  if (ent.type === EntityType.Language)
    return uniqueBy(
      [ent.equivalentVariant, ...(ent.variants ?? [])].filter((v) => !!v),
      (v) => v.ID,
    );
  return undefined;
}
