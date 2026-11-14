import type { MapGeoJSONFeature } from 'maplibre-gl';
import { useCallback, useMemo } from 'react';

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
  const { getScale } = useScale({ ents: drawableEntities, scaleBy });
  const colorFunction = colorBy === Field.None ? null : getColor;
  const territories = useTerritoryContent({ drawableEntities, getColor: colorFunction, colors });

  // Every entity gets a dot; for languages, which ones show depends on the view (see
  // useRevealInView).
  const dotEntities = drawableEntities;
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
    showLabels: fieldFocus !== Field.None,
    territoryIds: territories.territoryIds,
    territoryFill: territories.territoryFill,
    getFeatureEntity,
  };
}

export default useMapContent;
