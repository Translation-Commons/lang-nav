import type { FeatureCollection, Point } from 'geojson';

import Field from '@features/transforms/fields/Field';
import { getFieldString } from '@features/transforms/fields/getFieldString';

import { EntityType } from '@entities/types/EntityTypes';

import DrawableData from '../DrawableData';
import getEntityPosition, { getPlacedEntity } from '../getEntityPosition';
import { resolveCssColor } from '../style/resolveCssColor';

// Territories this big are already visible as shapes, so they only get a label, not a dot.
const MIN_LAND_AREA_WITHOUT_DOT = 20_000;
// Sizes below are in "map units": 1/360th of the map's width when showing the whole world.
const DOT_MIN_RADIUS = 1.5;
const LABEL_GAP = 1;
const LABEL_EM_PX = 16;

export type DotProperties = {
  id: string;
  hasDot: boolean;
  radius: number;
  strokeWidth: number;
  fillColor: string;
  strokeColor: string;
  label: string;
  labelSize: number;
  labelOffset: [number, number];
  order: number;
};

export type DotOptions = {
  mapUnitPx: number;
  sizeScalar: number;
  getScale: (ent: DrawableData) => number;
  getColor: ((ent: DrawableData) => string | undefined) | null;
  outlineColor: string;
  labelField: Field;
};

/**
 * One map point per entity, carrying everything the dot and label layers paint with.
 * Entities come most important first; `order` keeps that so they are drawn on top.
 */
function buildDotFeatures(
  entities: DrawableData[],
  options: DotOptions,
): FeatureCollection<Point, DotProperties> {
  const features = entities.flatMap((ent, index) => {
    const position = getEntityPosition(ent);
    if (!position) return [];
    const properties = getDotProperties(ent, options);
    return [
      {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: position },
        properties: { ...properties, order: entities.length - index },
      },
    ];
  });
  return { type: 'FeatureCollection', features };
}

function getDotProperties(ent: DrawableData, options: DotOptions): Omit<DotProperties, 'order'> {
  const { mapUnitPx, sizeScalar, getScale, getColor, outlineColor, labelField } = options;
  const placed = getPlacedEntity(ent);
  const hasDot = !(
    placed?.type === EntityType.Territory && (placed.landArea ?? 0) >= MIN_LAND_AREA_WITHOUT_DOT
  );
  const scale = sizeScalar * getScale(ent);
  const color = getColor ? getColor(ent) : undefined;
  const labelSize = (scale / 3) * LABEL_EM_PX * mapUnitPx;

  return {
    id: ent.ID,
    hasDot,
    radius: (scale + DOT_MIN_RADIUS) * mapUnitPx,
    strokeWidth: mapUnitPx,
    fillColor: color ? resolveCssColor(color) : 'rgba(0, 0, 0, 0)',
    strokeColor: getColor ? 'rgba(0, 0, 0, 0)' : outlineColor,
    label: (labelField !== Field.None && getFieldString(ent, labelField)) || '',
    labelSize,
    // In ems, as MapLibre wants it: below the dot, or centred on the territory without one.
    labelOffset: [
      0,
      hasDot && labelSize > 0 ? ((scale + DOT_MIN_RADIUS + LABEL_GAP) * mapUnitPx) / labelSize : 0,
    ],
  };
}

export default buildDotFeatures;
