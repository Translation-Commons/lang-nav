import type { MapGeoJSONFeature } from 'maplibre-gl';
import { useCallback, useMemo } from 'react';

import usePagination from '@features/pagination/usePagination';
import usePageParams from '@features/params/usePageParams';
import { ColoringFunctions } from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';
import useScale from '@features/transforms/scales/useScale';

import { EntityType } from '@entities/types/EntityTypes';

import buildDotFeatures from './dots/buildDotFeatures';
import DrawableData from './DrawableData';
import { DOTS_SOURCE_ID } from './mapLayerIds';
import type { MapThemeColors } from './style/useMapThemeColors';
import useTerritoryContent from './territories/useTerritoryContent';

type Options = {
  drawableEntities: DrawableData[];
  coloringFunctions: ColoringFunctions;
  colors: MapThemeColors;
  mapWidthPx: number;
  sizeScalar: number;
};

function useMapContent({
  drawableEntities,
  coloringFunctions: { colorBy, getColor },
  colors,
  mapWidthPx,
  sizeScalar,
}: Options) {
  const { entType, scaleBy, fieldFocus } = usePageParams();
  const { getCurrentEntities } = usePagination<DrawableData>();
  const { getScale } = useScale({ ents: drawableEntities, scaleBy });
  const colorFunction = colorBy === Field.None ? null : getColor;
  const territories = useTerritoryContent({ drawableEntities, getColor: colorFunction, colors });

  // Languages are many, so only the current page of them is placed.
  const dotEntities = useMemo(
    () =>
      entType === EntityType.Language ? getCurrentEntities(drawableEntities) : drawableEntities,
    [drawableEntities, getCurrentEntities, entType],
  );
  const dotEntitiesById = useMemo(
    () => new Map(dotEntities.map((ent) => [ent.ID, ent])),
    [dotEntities],
  );

  const dots = useMemo(
    () =>
      buildDotFeatures(dotEntities, {
        mapUnitPx: mapWidthPx / 360,
        sizeScalar,
        getScale,
        getColor: colorFunction,
        outlineColor: colors.primary,
        labelField: fieldFocus,
      }),
    [dotEntities, mapWidthPx, sizeScalar, getScale, colorFunction, colors, fieldFocus],
  );

  const { getTerritoryEntity } = territories;
  const getFeatureEntity = useCallback(
    (feature: MapGeoJSONFeature) => {
      const id = String(feature.id);
      if (feature.source !== DOTS_SOURCE_ID) return getTerritoryEntity(id);
      const ent = dotEntitiesById.get(id);
      return ent ? { ent, showData: true } : null;
    },
    [dotEntitiesById, getTerritoryEntity],
  );

  return {
    dots,
    showTerritories: entType !== EntityType.Language,
    territoryIds: territories.territoryIds,
    territoryFill: territories.territoryFill,
    getFeatureEntity,
  };
}

export default useMapContent;
