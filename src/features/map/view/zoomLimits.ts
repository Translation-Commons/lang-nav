import type { Map as MapLibreMap } from 'maplibre-gl';

import type { LngLatBounds } from './getEntityBounds';

// The inhabited world, centred 11° east like the old map so the Pacific is not split.
export const WORLD_BOUNDS: LngLatBounds = [
  [-169, -56],
  [191, 76],
];
export const MAX_AUTO_ZOOM_IN = Math.log2(8);
const MAX_ZOOM_IN = Math.log2(16);
// MapLibre rejects a minimum zoom below this.
const LOWEST_ZOOM = -2;

/** Stops zooming out past the whole world, which depends on the map's size. */
export function applyZoomLimits(map: MapLibreMap) {
  // A map with no size yet has no finite zoom that fits the world.
  const worldZoom = map.cameraForBounds(WORLD_BOUNDS)?.zoom ?? LOWEST_ZOOM;
  const minZoom = Number.isFinite(worldZoom) ? Math.max(LOWEST_ZOOM, worldZoom) : LOWEST_ZOOM;
  map.setMinZoom(minZoom);
  map.setMaxZoom(minZoom + MAX_ZOOM_IN);
}
