import type { Map as MapLibreMap } from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { LngLatBounds } from './getEntityBounds';
import useKeepViewOnResize from './useKeepViewOnResize';
import { applyZoomLimits, MAX_AUTO_ZOOM_IN, WORLD_BOUNDS } from './zoomLimits';

const ZOOM_STEP = Math.log2(1.5);
const ANIMATION_MS = 300;
const FIT_PADDING = 0.075;

/** Frames the map on the current entities whenever they change, and drives the zoom buttons. */
function useMapCamera(entityBounds: LngLatBounds | null) {
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const lastFittedBoundsRef = useRef<string | null>(null);
  useKeepViewOnResize(map);

  const onLoad = useCallback((loadedMap: MapLibreMap) => {
    applyZoomLimits(loadedMap);
    loadedMap.fitBounds(WORLD_BOUNDS, { duration: 0 });
    loadedMap.touchZoomRotate.disableRotation();
    loadedMap.keyboard.disableRotation();
    setMap(loadedMap);
  }, []);

  useEffect(() => {
    if (!map || !entityBounds) return;
    const boundsKey = entityBounds
      .flat()
      .map((value) => value.toFixed(2))
      .join(':');
    if (lastFittedBoundsRef.current === boundsKey) return;
    const isFirstFit = lastFittedBoundsRef.current === null;
    lastFittedBoundsRef.current = boundsKey;

    const { clientWidth, clientHeight } = map.getContainer();
    const vertical = clientHeight * FIT_PADDING;
    const horizontal = clientWidth * FIT_PADDING;
    map.fitBounds(entityBounds, {
      padding: { top: vertical, bottom: vertical, left: horizontal, right: horizontal },
      maxZoom: map.getMinZoom() + MAX_AUTO_ZOOM_IN,
      // Instant on first load to avoid a flash from the world to the fitted view.
      duration: isFirstFit ? 0 : 400,
    });
  }, [map, entityBounds]);

  const zoomIn = useCallback(
    () => map?.zoomTo(map.getZoom() + ZOOM_STEP, { duration: ANIMATION_MS }),
    [map],
  );
  const zoomOut = useCallback(
    () => map?.zoomTo(map.getZoom() - ZOOM_STEP, { duration: ANIMATION_MS }),
    [map],
  );
  const resetView = useCallback(
    () => map?.fitBounds(WORLD_BOUNDS, { duration: ANIMATION_MS }),
    [map],
  );

  return { onLoad, zoomIn, zoomOut, resetView };
}

export default useMapCamera;
