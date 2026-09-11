import { EntityType } from '@features/params/PageParamTypes';

import DrawableData from '../DrawableData';
import { getRobinsonCoordinatesShifted } from '../getRobinsonCoordinates';
import { MAP_INTERNAL_WIDTH, MAP_ROBINSON_X_SCALE, MAP_ROBINSON_Y_SCALE } from '../MapConsts';

function computeEntityBounds(drawableEntities: DrawableData[], mapHeight: number) {
  // The centroid SVG uses viewBox "-180 -90 360 180" with preserveAspectRatio
  // "xMidYMid meet", rendered into the content element (MAP_INTERNAL_WIDTH x mapHeight).
  const svgScale = Math.min(MAP_INTERNAL_WIDTH / 360, mapHeight / 180);
  const offsetX = (MAP_INTERNAL_WIDTH - 360 * svgScale) / 2;
  const offsetY = (mapHeight - 180 * svgScale) / 2;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let count = 0;

  drawableEntities.forEach((ent) => {
    const { x, y } = getRobinsonCoordinatesShifted(ent);
    if (x == 0 && y == 0) return; // Sorry null island, not today
    const mapX = (x * MAP_ROBINSON_X_SCALE + 180) * svgScale + offsetX;
    const mapY = (-y * MAP_ROBINSON_Y_SCALE + 90) * svgScale + offsetY;
    const padding = getEntityPadding(ent); // Example padding for locales
    minX = Math.min(minX, mapX - padding);
    maxX = Math.max(maxX, mapX + padding);
    minY = Math.min(minY, mapY - padding);
    maxY = Math.max(maxY, mapY + padding);
    count++;
  });

  if (count === 0) return null;
  return { minX, minY, maxX, maxY };
}

function getEntityPadding(ent: DrawableData): number {
  if (ent.type === EntityType.Locale) {
    return ent.territory ? getEntityPadding(ent.territory) : 0;
  }
  if (ent.type === EntityType.Territory && ent.landArea) {
    return ent.landArea > 1_000_000 ? ent.landArea ** 0.5 / 100 : 0;
  }
  return 0;
}

export default computeEntityBounds;
