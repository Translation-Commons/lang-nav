// Kept apart from the layer components so code outside the lazily loaded map can use them
// without pulling MapLibre into the main bundle.
export const COUNTRIES_SOURCE_ID = 'countries';
export const LAND_LAYER_ID = 'land';
export const BORDERS_LAYER_ID = 'borders';
// An empty layer marking where the page's own layers go, above the base map.
export const OVERLAYS_START_LAYER_ID = 'overlays-start';
export const TERRITORIES_LAYER_ID = 'territories';
export const DOTS_SOURCE_ID = 'dots';
export const DOTS_LAYER_ID = 'dots';
