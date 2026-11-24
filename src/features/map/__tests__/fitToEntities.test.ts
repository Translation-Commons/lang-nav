import type { Map as MapLibreMap } from 'maplibre-gl';
import { describe, expect, it, vi } from 'vitest';

import fitToEntities from '../view/fitToEntities';
import type { LngLatBounds } from '../view/getEntityBounds';

function makeMap(projection: 'globe' | 'mercator') {
  return {
    getProjection: () => ({ type: projection }),
    getContainer: () => ({ clientWidth: 1000, clientHeight: 500 }),
    getMinZoom: () => 1,
    cameraForBounds: () => ({ zoom: 1 }),
    fitBounds: vi.fn(),
    easeTo: vi.fn(),
  };
}

const africa: LngLatBounds = [
  [-20, -35],
  [55, 38],
];
const wholeWorld: LngLatBounds = [
  [-170, -50],
  [180, 70],
];

describe('fitToEntities', () => {
  it('frames the results on a flat map', () => {
    const map = makeMap('mercator');
    fitToEntities(map as unknown as MapLibreMap, wholeWorld, 0);
    expect(map.fitBounds).toHaveBeenCalled();
  });

  it('frames results that fit on one side of the globe', () => {
    const map = makeMap('globe');
    fitToEntities(map as unknown as MapLibreMap, africa, 0);
    expect(map.fitBounds).toHaveBeenCalled();
  });

  it('shows the whole globe when results spread around it', () => {
    const map = makeMap('globe');
    fitToEntities(map as unknown as MapLibreMap, wholeWorld, 0);
    expect(map.fitBounds).not.toHaveBeenCalled();
    expect(map.easeTo).toHaveBeenCalledWith(expect.objectContaining({ center: [11, 15] }));
  });
});
