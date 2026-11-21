import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Flags the map element with data-map-idle="true" once everything is drawn and nothing is
 * moving or loading, so screenshot tests know when the WebGL canvas is ready.
 */
function markMapIdle(map: MapLibreMap) {
  const element = map.getContainer();
  const setIdle = (isIdle: boolean) => (element.dataset.mapIdle = String(isIdle));
  setIdle(false);
  map.on('idle', () => setIdle(true));
  map.on('dataloading', () => setIdle(false));
  map.on('movestart', () => setIdle(false));
}

export default markMapIdle;
