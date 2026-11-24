import { describe, expect, it, vi } from 'vitest';

import Field from '@features/transforms/fields/Field';

import buildDotFeatures, { DotOptions } from '../dots/buildDotFeatures';

import { makeTerritory } from './mapTestEntities';

// jsdom has no canvas to resolve colours with, so pass them through.
vi.mock('../style/resolveCssColor', () => ({ resolveCssColor: (color: string) => color }));

const options: DotOptions = {
  mapUnitPx: 2,
  sizeScalar: 1,
  getScale: () => 1,
  getColor: null,
  outlineColor: 'rgba(0, 0, 255, 1)',
  labelField: Field.None,
};

describe('buildDotFeatures', () => {
  it('makes one point per placed entity, the first drawn on top', () => {
    const { features } = buildDotFeatures(
      [
        makeTerritory('A', { latitude: 1, longitude: 2 }),
        makeTerritory('B'),
        makeTerritory('C', { latitude: 3, longitude: 4 }),
      ],
      options,
    );
    expect(features.map((feature) => feature.properties.id)).toEqual(['A', 'C']);
    expect(features[0].geometry.coordinates).toEqual([2, 1]);
    expect(features[0].properties.order).toBeGreaterThan(features[1].properties.order);
  });

  it('outlines dots when not colouring and fills them when colouring', () => {
    const territory = makeTerritory('A', { latitude: 1, longitude: 2 });
    const outlined = buildDotFeatures([territory], options).features[0].properties;
    expect(outlined.fillColor).toBe('rgba(0, 0, 0, 0)');
    expect(outlined.strokeColor).toBe(options.outlineColor);

    const filled = buildDotFeatures([territory], { ...options, getColor: () => '#ff0000' })
      .features[0].properties;
    expect(filled.fillColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(filled.strokeColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('sizes dots in map units, scaled by the size field', () => {
    const territory = makeTerritory('A', { latitude: 1, longitude: 2 });
    const small = buildDotFeatures([territory], options).features[0].properties;
    const large = buildDotFeatures([territory], { ...options, getScale: () => 3 }).features[0]
      .properties;
    expect(small.radius).toBe((1 + 1.5) * 2);
    expect(large.radius).toBe((3 + 1.5) * 2);
  });

  it('labels large territories at their centre without a dot', () => {
    const large = makeTerritory('BR', { latitude: -10, longitude: -55, landArea: 8_500_000 });
    const small = makeTerritory('MT', { latitude: 36, longitude: 14, landArea: 316 });
    const [brazil, malta] = buildDotFeatures([large, small], {
      ...options,
      labelField: Field.Name,
    }).features.map((feature) => feature.properties);

    expect(brazil).toMatchObject({ hasDot: false, label: 'Territory BR', labelOffset: [0, 0] });
    expect(malta.hasDot).toBe(true);
    expect(malta.labelOffset[1]).toBeGreaterThan(0);
  });

  it('leaves labels empty when no field is chosen', () => {
    const territory = makeTerritory('A', { latitude: 1, longitude: 2 });
    expect(buildDotFeatures([territory], options).features[0].properties.label).toBe('');
  });
});
