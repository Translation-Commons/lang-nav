import type { FeatureCollection, Point } from 'geojson';
import type { ExpressionSpecification } from 'maplibre-gl';

import type { LngLatBounds } from '../view/getEntityBounds';

import type { DotProperties } from './buildDotFeatures';

// The map repeats sideways, so a place can be on screen one world to the left or right.
const WORLD_OFFSETS = [0, -360, 360];

function isInView([longitude, latitude]: number[], view: LngLatBounds): boolean {
  const [[west, south], [east, north]] = view;
  if (latitude < south || latitude > north) return false;
  return WORLD_OFFSETS.some((offset) => {
    const shifted = longitude + offset;
    return shifted >= west && shifted <= east;
  });
}

/**
 * The lowest `order` a dot needs to be shown, so that at most `limit` dots are in view: the
 * most important ones there. Dots come most important first, so zooming in only ever adds dots,
 * because a dot that made the cut for a bigger area ranks at least as high in a smaller one.
 * Returns 0, showing everything, when there is no limit or fewer dots than that in view.
 */
export function getMinOrderInView(
  dots: FeatureCollection<Point, DotProperties>,
  view: LngLatBounds,
  limit: number,
): number {
  if (limit < 1) return 0;
  let inView = 0;
  for (const dot of dots.features) {
    if (!isInView(dot.geometry.coordinates, view)) continue;
    inView += 1;
    if (inView === limit) return dot.properties.order;
  }
  return 0;
}

const isHovered: ExpressionSpecification = ['boolean', ['feature-state', 'hover'], false];

function isRevealed(minOrder: number): ExpressionSpecification {
  return ['>=', ['get', 'order'], minOrder];
}

/**
 * Hidden dots get no size rather than being removed from the data, so revealing them is a
 * cheap repaint instead of reloading every dot.
 */
export function getRevealedDotPaint(minOrder: number) {
  return {
    'circle-radius': [
      'case',
      isRevealed(minOrder),
      ['*', ['get', 'radius'], ['case', isHovered, 1.5, 1]],
      0,
    ] as ExpressionSpecification,
    'circle-stroke-width': [
      'case',
      isRevealed(minOrder),
      ['get', 'strokeWidth'],
      0,
    ] as ExpressionSpecification,
  };
}

export function getRevealedLabelFilter(minOrder: number): ExpressionSpecification {
  return ['all', ['!=', ['get', 'label'], ''], isRevealed(minOrder)];
}
