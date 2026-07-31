import { describe, expect, it } from 'vitest';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import { buildFilterByPopulation } from '../filterByRange';

describe('buildFilterByPopulation', () => {
  const langs = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => getBaseLanguageData(id, id));
  langs[0].pop.overall = undefined;
  langs[1].pop.overall = 0;
  langs[2].pop.overall = 1;
  langs[3].pop.overall = 100;
  langs[4].pop.overall = 1000;
  langs[5].pop.overall = 10_000_000_000;
  langs[6].pop.overall = 100_000_000_000; // unrealistically high population to test upper bound

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
