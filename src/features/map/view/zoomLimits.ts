import type { CameraOptions, Map as MapLibreMap } from 'maplibre-gl';

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

// The globe faces Africa and Europe, tilted a little north where most people live.
const GLOBE_CENTER: [number, number] = [11, 15];
// How much of the map's height the whole globe takes up.
const GLOBE_HEIGHT_SHARE = 0.92;
const TILE_SIZE_PX = 512;

export function isGlobe(map: MapLibreMap): boolean {
  return map.getProjection()?.type === 'globe';
}

/** The camera that shows the whole world: the inhabited bounds when flat, otherwise the globe. */
export function getWorldCamera(map: MapLibreMap): CameraOptions {
  if (isGlobe(map)) {
    // At zoom z the globe is 512 * 2^z / π pixels across.
    const height = map.getContainer().clientHeight * GLOBE_HEIGHT_SHARE;
    return { center: GLOBE_CENTER, zoom: Math.log2((height * Math.PI) / TILE_SIZE_PX) };
  }
  return map.cameraForBounds(WORLD_BOUNDS) ?? {};
}

/** Stops zooming out past the whole world, which depends on the map's size and projection. */
export function applyZoomLimits(map: MapLibreMap) {
  // A map with no size yet has no finite zoom that fits the world.
  const worldZoom = getWorldCamera(map).zoom ?? LOWEST_ZOOM;
  const minZoom = Number.isFinite(worldZoom) ? Math.max(LOWEST_ZOOM, worldZoom) : LOWEST_ZOOM;
  map.setMinZoom(minZoom);
  map.setMaxZoom(minZoom + MAX_ZOOM_IN);
}

/** Moves to the whole-world view, animated over `duration` milliseconds. */
export function showWholeWorld(map: MapLibreMap, duration: number) {
  map.easeTo({ ...getWorldCamera(map), duration });
}
