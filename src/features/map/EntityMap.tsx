import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PinnedMiniCardList from '@widgets/cardlists/PinnedMiniCardList';

import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';
import ColorBar from '@features/transforms/coloring/ColorBar';
import useColors from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';
import { useSortFunction } from '@features/transforms/sorting/sort';

import { EntityData, EntityType } from '@entities/types/EntityTypes';

import DrawableData from './DrawableData';
import getDrawableEntities from './getDrawableEntities';
import { DOTS_LAYER_ID, TERRITORIES_LAYER_ID } from './mapLayerIds';
import './map.css';
import useMapThemeColors from './style/useMapThemeColors';
import useMapContent from './useMapContent';
import getEntityBounds from './view/getEntityBounds';
import useMapCamera from './view/useMapCamera';
import useMapPointer from './view/useMapPointer';
import useRevealInView from './view/useRevealInView';
import ZoomControls from './ZoomControls';

const MapCanvas = lazy(() => import('./MapCanvas'));

const DOT_LAYERS = [DOTS_LAYER_ID];
const MAP_AND_DOT_LAYERS = [DOTS_LAYER_ID, TERRITORIES_LAYER_ID];
const NO_PINS: string[] = [];

type Props = {
  entities: EntityData[];
  maxWidth?: number;
  allowSidebar?: boolean;
  allowColorBar?: boolean;
};

const EntityMap: React.FC<Props> = ({
  entities,
  maxWidth = 2000,
  allowSidebar = false,
  allowColorBar = true,
}) => {
  const { colorBy, entType, limit, pinned, updatePageParams } = usePageParams();
  const sortFunction = useSortFunction();
  const colors = useMapThemeColors();
  const container = useContainerWidth();

  // Coordinates are added to the same entity objects once supplemental data loads, so the
  // loading stage is what tells us to place everything again.
  const { loadingStage } = useDataContext();
  const drawableEntities = useMemo(
    () => getDrawableEntities([...entities].sort(sortFunction), entType),
    [entities, sortFunction, entType, loadingStage],
  );
  const coloringFunctions = useColors({ ents: drawableEntities });
  const entityBounds = useMemo(() => getEntityBounds(drawableEntities), [drawableEntities]);
  const camera = useMapCamera(entityBounds);
  const content = useMapContent({
    drawableEntities,
    coloringFunctions,
    colors,
    mapWidthPx: container.width,
    sizeScalar: 1200 / maxWidth,
  });

  const onClick = useCallback(
    (entity: DrawableData) => {
      if (!allowSidebar) return updatePageParams({ entID: entity.ID });
      updatePageParams({
        pinned: pinned.includes(entity.ID)
          ? pinned.filter((id) => id !== entity.ID)
          : [...pinned, entity.ID],
      });
    },
    [pinned, updatePageParams, allowSidebar],
  );
  const interactiveLayerIds = content.showTerritories ? MAP_AND_DOT_LAYERS : DOT_LAYERS;
  const pointer = useMapPointer({
    getFeatureEntity: content.getFeatureEntity,
    interactiveLayerIds,
    onClick,
    allowSidebar,
  });

  const pinnedIds = allowSidebar ? pinned : NO_PINS;
  // Languages are many, so the limit counts the ones in view rather than the whole list.
  const minOrder = useRevealInView(
    camera.map,
    content.dots,
    limit,
    entType === EntityType.Language,
  );

  return (
    <div ref={container.ref} className="EntityMap" style={{ maxWidth: maxWidth }}>
      <ZoomControls
        zoomIn={camera.zoomIn}
        zoomOut={camera.zoomOut}
        resetView={camera.resetView}
        containerWidth={container.width}
      />

      <div className="MapColorBarAndZoomContainer">
        <div className="MapZoomContainer">
          <Suspense>
            <MapCanvas
              content={content}
              colors={colors}
              pinnedIds={pinnedIds}
              minOrder={minOrder}
              interactiveLayerIds={interactiveLayerIds}
              onLoad={camera.onLoad}
              {...pointer}
            />
          </Suspense>
        </div>

        {colorBy !== Field.None && allowColorBar && (
          <ColorBar coloringFunctions={coloringFunctions} />
        )}
        {allowSidebar && <PinnedMiniCardList />}
      </div>
    </div>
  );
};

function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const newWidth = entries[0]?.contentRect.width;
      if (newWidth) setWidth(newWidth);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

export default EntityMap;
