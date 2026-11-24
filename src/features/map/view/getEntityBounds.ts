import { EntityType } from '@entities/types/EntityTypes';

import DrawableData from '../DrawableData';
import getEntityPosition, { getPlacedEntity } from '../getEntityPosition';

export type LngLatBounds = [[number, number], [number, number]];

/** The box around every placed entity, grown so large countries are not cut off at the edge. */
function getEntityBounds(entities: DrawableData[]): LngLatBounds | null {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  entities.forEach((ent) => {
    const position = getEntityPosition(ent);
    if (!position) return;
    const [longitude, latitude] = position;
    const margin = getMarginDegrees(ent);
    west = Math.min(west, longitude - margin);
    east = Math.max(east, longitude + margin);
    south = Math.min(south, latitude - margin);
    north = Math.max(north, latitude + margin);
  });

  if (west === Infinity) return null;
  return [
    [west, Math.max(south, -85)],
    [east, Math.min(north, 85)],
  ];
}

function getMarginDegrees(ent: DrawableData): number {
  const placed = getPlacedEntity(ent);
  if (placed?.type === EntityType.Territory && placed.landArea && placed.landArea > 1_000_000) {
    return placed.landArea ** 0.5 / 100;
  }
  return 0;
}

export default getEntityBounds;
