import type { Map as MapLibreMap } from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';

import fitToEntities from './fitToEntities';
import type { LngLatBounds } from './getEntityBounds';
import useKeepViewOnResize from './useKeepViewOnResize';
import { applyZoomLimits, isGlobe, showWholeWorld } from './zoomLimits';

const ZOOM_STEP = Math.log2(1.5);
const ANIMATION_MS = 300;

/**
 * Frames the map on the current entities whenever they change or the map switches between flat
 * and globe, and drives the zoom buttons.
 */
function useMapCamera(entityBounds: LngLatBounds | null, showAsGlobe: boolean) {
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const lastFittedBoundsRef = useRef<string | null>(null);
  useKeepViewOnResize(map);

  const onLoad = useCallback((loadedMap: MapLibreMap) => {
    applyZoomLimits(loadedMap);
    showWholeWorld(loadedMap, 0);
    loadedMap.touchZoomRotate.disableRotation();
    loadedMap.keyboard.disableRotation();
    setMap(loadedMap);
  }, []);

  useEffect(() => {
    if (!map || !entityBounds) return;
    const boundsKey = [showAsGlobe, ...entityBounds.flat().map((value) => value.toFixed(2))].join(
      ':',
    );
    if (lastFittedBoundsRef.current === boundsKey) return;
    const isFirstFit = lastFittedBoundsRef.current === null;

    // The projection switch lands a moment after the setting changes, and the world's size and
    // the framing both depend on it, so wait for the map to catch up.
    const frame = () => {
      if (isGlobe(map) !== showAsGlobe) return;
      map.off('styledata', frame);
      lastFittedBoundsRef.current = boundsKey;
      applyZoomLimits(map);
      // Instant on first load to avoid a flash from the world to the fitted view.
      fitToEntities(map, entityBounds, isFirstFit ? 0 : 400);
    };
    map.on('styledata', frame);
    frame();
    return () => {
      map.off('styledata', frame);
    };
  }, [map, entityBounds, showAsGlobe]);

  const zoomIn = useCallback(
    () => map?.zoomTo(map.getZoom() + ZOOM_STEP, { duration: ANIMATION_MS }),
    [map],
  );
  const zoomOut = useCallback(
    () => map?.zoomTo(map.getZoom() - ZOOM_STEP, { duration: ANIMATION_MS }),
    [map],
  );
  const resetView = useCallback(() => map && showWholeWorld(map, ANIMATION_MS), [map]);

  return { map, onLoad, zoomIn, zoomOut, resetView };
}

export default useMapCamera;
