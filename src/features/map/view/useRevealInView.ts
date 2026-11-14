import type { FeatureCollection, Point } from 'geojson';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { useEffect, useState } from 'react';

import type { DotProperties } from '../dots/buildDotFeatures';
import { getMinOrderInView, getRevealedDotPaint } from '../dots/revealDots';
import { DOTS_LAYER_ID } from '../mapLayerIds';

import type { LngLatBounds } from './getEntityBounds';

function readView(map: MapLibreMap): LngLatBounds {
  const bounds = map.getBounds();
  return [
    [bounds.getWest(), bounds.getSouth()],
    [bounds.getEast(), bounds.getNorth()],
  ];
}

/**
 * Keeps at most `limit` dots in view, the most important ones there, so zooming in reveals
 * more and zooming out hides them. Returns the cut-off `order` for the layers to paint with.
 *
 * While the map moves, the dots are repainted directly every frame. Going through React would
 * re-render the whole map each frame. React gets the final value once the move ends.
 */
function useRevealInView(
  map: MapLibreMap | null,
  dots: FeatureCollection<Point, DotProperties>,
  limit: number,
  isEnabled: boolean,
): number {
  const [minOrder, setMinOrder] = useState(0);

  useEffect(() => {
    if (!map || !isEnabled) return setMinOrder(0);
    let frame: number | null = null;
    let appliedMinOrder: number | null = null;
    const getCurrent = () => getMinOrderInView(dots, readView(map), limit);

    const repaint = () => {
      frame = null;
      const next = getCurrent();
      if (next === appliedMinOrder || !map.getLayer(DOTS_LAYER_ID)) return;
      appliedMinOrder = next;
      const paint = getRevealedDotPaint(next);
      map.setPaintProperty(DOTS_LAYER_ID, 'circle-radius', paint['circle-radius']);
      map.setPaintProperty(DOTS_LAYER_ID, 'circle-stroke-width', paint['circle-stroke-width']);
    };
    const onMove = () => {
      if (frame === null) frame = requestAnimationFrame(repaint);
    };
    const onMoveEnd = () => setMinOrder(getCurrent());

    onMoveEnd();
    map.on('move', onMove);
    map.on('moveend', onMoveEnd);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      map.off('move', onMove);
      map.off('moveend', onMoveEnd);
    };
  }, [map, dots, limit, isEnabled]);

  return minOrder;
}

export default useRevealInView;
