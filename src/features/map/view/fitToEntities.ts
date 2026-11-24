import type { Map as MapLibreMap } from 'maplibre-gl';

import type { LngLatBounds } from './getEntityBounds';
import { isGlobe, MAX_AUTO_ZOOM_IN, showWholeWorld } from './zoomLimits';

const FIT_PADDING = 0.075;
// A globe shows one side of the world, so results spread wider than this are shown whole.
const GLOBE_MAX_FIT_DEGREES = 150;

/** Frames the map on the given entities, without zooming in more than 8× past the world. */
function fitToEntities(map: MapLibreMap, bounds: LngLatBounds, duration: number) {
  const [[west], [east]] = bounds;
  if (isGlobe(map) && east - west > GLOBE_MAX_FIT_DEGREES) return showWholeWorld(map, duration);

  const { clientWidth, clientHeight } = map.getContainer();
  const vertical = clientHeight * FIT_PADDING;
  const horizontal = clientWidth * FIT_PADDING;
  map.fitBounds(bounds, {
    padding: { top: vertical, bottom: vertical, left: horizontal, right: horizontal },
    maxZoom: map.getMinZoom() + MAX_AUTO_ZOOM_IN,
    duration,
  });
}

export default fitToEntities;
