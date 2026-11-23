import type { StyleSpecification } from 'maplibre-gl';

import {
  BORDERS_LAYER_ID,
  COUNTRIES_SOURCE_ID,
  LAND_LAYER_ID,
  OVERLAYS_START_LAYER_ID,
} from '../mapLayerIds';

import type { MapThemeColors } from './useMapThemeColors';

/**
 * Ocean, land and, when turned on, borders. Everything is drawn from one countries file we host
 * ourselves, so there is no tile server or API key. Without a `glyphs` URL, labels use the
 * browser's own fonts, which covers every script.
 */
export function getBaseMapStyle(colors: MapThemeColors, showBorders: boolean): StyleSpecification {
  return {
    version: 8,
    sources: {
      [COUNTRIES_SOURCE_ID]: {
        type: 'geojson',
        data: `${import.meta.env.BASE_URL}data/naturalearth/countries.geojson`,
        promoteId: 'iso',
      },
    },
    layers: [
      { id: 'ocean', type: 'background', paint: { 'background-color': colors.ocean } },
      {
        id: LAND_LAYER_ID,
        type: 'fill',
        source: COUNTRIES_SOURCE_ID,
        paint: { 'fill-color': colors.land },
      },
      {
        id: BORDERS_LAYER_ID,
        type: 'line',
        source: COUNTRIES_SOURCE_ID,
        layout: { visibility: showBorders ? 'visible' : 'none' },
        paint: { 'line-color': colors.border, 'line-width': 0.5 },
      },
      { id: OVERLAYS_START_LAYER_ID, type: 'background', layout: { visibility: 'none' } },
    ],
  };
}
