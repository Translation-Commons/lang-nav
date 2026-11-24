import { describe, expect, it, vi } from 'vitest';

import Field from '@features/transforms/fields/Field';

import buildDotFeatures from '../dots/buildDotFeatures';
import { getMinOrderInView } from '../dots/revealDots';
import type { LngLatBounds } from '../view/getEntityBounds';

import { makeTerritory } from './mapTestEntities';

// jsdom has no canvas to resolve colours with, so pass them through.
vi.mock('../style/resolveCssColor', () => ({ resolveCssColor: (color: string) => color }));

const world: LngLatBounds = [
  [-180, -85],
  [180, 85],
];
const africa: LngLatBounds = [
  [-20, -35],
  [55, 38],
];

// Most important first, as the map receives them.
const dots = buildDotFeatures(
  [
    makeTerritory('NG', { latitude: 9, longitude: 8 }),
    makeTerritory('IN', { latitude: 22, longitude: 79 }),
    makeTerritory('XX'),
    makeTerritory('KE', { latitude: 0.5, longitude: 38 }),
    makeTerritory('GH', { latitude: 8, longitude: -1 }),
  ],
  {
    mapUnitPx: 1,
    sizeScalar: 1,
    getScale: () => 1,
    getColor: null,
    outlineColor: 'blue',
    labelField: Field.None,
  },
);

function shownIds(view: LngLatBounds, limit: number): string[] {
  const minOrder = getMinOrderInView(dots, view, limit);
  return dots.features
    .filter((dot) => dot.properties.order >= minOrder)
    .map((dot) => dot.properties.id);
}

describe('getMinOrderInView', () => {
  it('keeps the most important dots in view, up to the limit', () => {
    expect(shownIds(world, 2)).toEqual(['NG', 'IN']);
    // India is out of view, so Kenya takes the second place in Africa.
    expect(shownIds(africa, 2).filter((id) => id !== 'IN')).toEqual(['NG', 'KE']);
  });

  it('only ever adds dots when zooming into an area', () => {
    const zoomedOut = shownIds(world, 2);
    const zoomedIn = shownIds(africa, 2);
    zoomedOut.forEach((id) => expect(zoomedIn).toContain(id));
    expect(zoomedIn).toContain('KE');
  });

  it('shows everything when there is no limit or fewer dots than the limit in view', () => {
    expect(getMinOrderInView(dots, africa, -1)).toBe(0);
    expect(getMinOrderInView(dots, africa, 10)).toBe(0);
  });

  it('counts places on the repeated world to either side', () => {
    // Longitudes 365 to 450 on the next world are 5 to 90 on this one: Nigeria, India, Kenya.
    const viewOnNextWorld: LngLatBounds = [
      [365, -10],
      [450, 40],
    ];
    expect(shownIds(viewOnNextWorld, 3)).toEqual(['NG', 'IN', 'KE']);
  });
});
