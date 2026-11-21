import type { LanguageData } from '@entities/language/LanguageTypes';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityType } from '@entities/types/EntityTypes';

import DrawableData from './DrawableData';

/** Locales have no place of their own, so they are drawn on their territory. */
export function getPlacedEntity(ent: DrawableData): LanguageData | TerritoryData | null {
  if (ent.type === EntityType.Locale) return ent.territory ?? null;
  return ent;
}

/**
 * Where an entity sits on the map as [longitude, latitude], or null if it has no coordinates.
 * Longitudes just west of the date line move to its east side, so places like the Aleutians
 * stay next to the rest of the Pacific instead of the far left.
 */
function getEntityPosition(ent: DrawableData): [number, number] | null {
  const placed = getPlacedEntity(ent);
  if (!placed) return null;
  const { latitude, longitude } = placed;
  if (latitude == null || longitude == null) return null;
  // 0,0 means the coordinates are missing, not a place in the Gulf of Guinea.
  if (latitude === 0 && longitude === 0) return null;
  return [longitude < -169 ? longitude + 360 : longitude, latitude];
}

export default getEntityPosition;
