import type {
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  MapMouseEvent,
} from 'maplibre-gl';
import { useCallback, useRef, useState } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';

import DrawableData from '../DrawableData';
import MapHoverCard from '../MapHoverCard';

type HoveredFeature = { source: string; id: string | number };

type Options = {
  /** Which entity a feature under the pointer stands for, and whether its card shows data. */
  getFeatureEntity: (feature: MapGeoJSONFeature) => { ent: DrawableData; showData: boolean } | null;
  interactiveLayerIds: string[];
  onClick: (ent: DrawableData) => void;
  allowSidebar: boolean;
};

/** Hover cards, hover highlights, the pointer cursor and clicks for dots and countries. */
function useMapPointer({ getFeatureEntity, interactiveLayerIds, onClick, allowSidebar }: Options) {
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const hoveredRef = useRef<HoveredFeature | null>(null);
  const [cursor, setCursor] = useState('grab');

  const setHovered = useCallback((map: MapLibreMap, next: HoveredFeature | null) => {
    const previous = hoveredRef.current;
    if (previous?.source === next?.source && previous?.id === next?.id) return false;
    if (previous) map.setFeatureState(previous, { hover: false });
    if (next) map.setFeatureState(next, { hover: true });
    hoveredRef.current = next;
    setCursor(next ? 'pointer' : 'grab');
    return true;
  }, []);

  const clearHover = useCallback(
    (map: MapLibreMap) => {
      if (setHovered(map, null)) onMouseLeaveTriggeringElement();
    },
    [setHovered, onMouseLeaveTriggeringElement],
  );

  const onMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const match = feature ? getFeatureEntity(feature) : null;
      if (!feature || feature.id == null || !match) return clearHover(event.target);
      if (!setHovered(event.target, { source: feature.source, id: feature.id })) return;
      const { clientX, clientY } = event.originalEvent;
      showHoverCard(
        <MapHoverCard ent={match.ent} allowSidebar={allowSidebar} showData={match.showData} />,
        clientX,
        clientY,
      );
    },
    [getFeatureEntity, setHovered, clearHover, showHoverCard, allowSidebar],
  );

  // Fires whenever the pointer leaves the canvas, including onto the zoom buttons or a dialog
  // on top of it, where MapLibre's own mouseleave would still see the feature underneath.
  const onMouseOut = useCallback((event: MapMouseEvent) => clearHover(event.target), [clearHover]);

  // Features remembered from the last mouse move are stale if the map zoomed since, so look
  // again at what is under the click.
  const onMapClick = useCallback(
    (event: MapMouseEvent) => {
      const map = event.target;
      const layers = interactiveLayerIds.filter((layerId) => map.getLayer(layerId));
      const [feature] = map.queryRenderedFeatures(event.point, { layers });
      const match = feature ? getFeatureEntity(feature) : null;
      if (match) onClick(match.ent);
    },
    [interactiveLayerIds, getFeatureEntity, onClick],
  );

  return { cursor, onMouseMove, onMouseOut, onClick: onMapClick };
}

export default useMapPointer;
