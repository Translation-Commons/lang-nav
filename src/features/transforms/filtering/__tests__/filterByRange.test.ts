import { describe, expect, it } from 'vitest';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import { buildFilterByPopulation } from '../filterByRange';

describe('buildFilterByPopulation', () => {
  const langs = [
    getBaseLanguageData('a', 'a'),
    { ...getBaseLanguageData('b', 'b'), populationEstimate: 0 },
    { ...getBaseLanguageData('c', 'c'), populationEstimate: 1 },
    { ...getBaseLanguageData('d', 'd'), populationEstimate: 100 },
    { ...getBaseLanguageData('e', 'e'), populationEstimate: 1000 },
    { ...getBaseLanguageData('f', 'f'), populationEstimate: 10_000_000_000 },
    { ...getBaseLanguageData('g', 'g'), populationEstimate: 100_000_000_000 }, // unrealistically high population to test upper bound
  ];

  it('does not filter when range are defaults', () => {
    const filter = buildFilterByPopulation(-1, 10_000_000_000);
    const filteredLangs = langs.filter(filter);
    expect(filteredLangs.map((l) => l.ID)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
  });

  it('filters languages by maximum population', () => {
    const filter = buildFilterByPopulation(-1, 100);
    const filteredLangs = langs.filter(filter);
    expect(filteredLangs.map((l) => l.ID)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('filters languages by minimum population', () => {
    const filter = buildFilterByPopulation(1000, 10_000_000_000);
    const filteredLangs = langs.filter(filter);
    expect(filteredLangs.map((l) => l.ID)).toEqual(['e', 'f', 'g']);
  });

  it('filters languages by both minimum and maximum population', () => {
    const filter = buildFilterByPopulation(1, 1000);
    const filteredLangs = langs.filter(filter);
    expect(filteredLangs.map((l) => l.ID)).toEqual(['c', 'd', 'e']);
  });

  it('minimum of 0 does not include languages with unknown population', () => {
    const filter = buildFilterByPopulation(0, 10_000_000_000);
    const filteredLangs = langs.filter(filter);
    expect(filteredLangs.map((l) => l.ID)).toEqual(['b', 'c', 'd', 'e', 'f', 'g']);
  });
});
