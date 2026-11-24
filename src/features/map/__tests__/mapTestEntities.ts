import type { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityType } from '@entities/types/EntityTypes';

export function makeTerritory(
  ID: string,
  fields: { latitude?: number; longitude?: number; landArea?: number } = {},
): TerritoryData {
  return {
    type: EntityType.Territory,
    ID,
    codeDisplay: ID,
    nameDisplay: `Territory ${ID}`,
    names: [`Territory ${ID}`],
    scope: TerritoryScope.Country,
    pop: { overall: 0 },
    ...fields,
  } as TerritoryData;
}

export function makeLocale(ID: string, territory?: TerritoryData): LocaleData {
  return { type: EntityType.Locale, ID, nameDisplay: ID, territory } as LocaleData;
}
