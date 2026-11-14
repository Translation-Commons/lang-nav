import type { LanguageData } from '@entities/language/LanguageTypes';
import { getEntityLocales } from '@entities/lib/getEntityRelatedTerritories';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityData, EntityType } from '@entities/types/EntityTypes';

import { uniqueBy } from '@shared/lib/setUtils';

import DrawableData from './DrawableData';

/** Turns the page's entities into the things the map can place: languages, locales or territories. */
function getDrawableEntities(sortedEntities: EntityData[], entType: EntityType): DrawableData[] {
  if (entType === EntityType.Language) {
    return sortedEntities.filter((ent) => ent.type === EntityType.Language) as LanguageData[];
  }

  if (entType === EntityType.Locale) {
    return uniqueBy(
      sortedEntities.filter(
        (ent) => ent.type === EntityType.Locale && ent.territory != null,
      ) as LocaleData[],
      (locale) => locale.territory?.ID || '',
    );
  }

  return uniqueBy(
    sortedEntities
      .flatMap((ent) => {
        if (ent.type === EntityType.Territory) return ent;
        if (ent.type === EntityType.Locale) return ent;
        if (ent.type === EntityType.Census) return ent.territory;
        if (ent.type === EntityType.WritingSystem)
          return getEntityLocales(ent).map((locale) => locale.territory);
        return undefined;
      })
      .filter((territory): territory is TerritoryData => territory !== undefined),
    (territory) => territory.ID,
  );
}

export default getDrawableEntities;
