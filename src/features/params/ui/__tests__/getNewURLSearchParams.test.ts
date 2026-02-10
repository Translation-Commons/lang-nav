import { describe, expect, it } from 'vitest';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { ObjectType, View } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

describe('getNewURLSearchParams', () => {
  it('migrates searchString to languageFilter when switching from Language', () => {
    const prev = new URLSearchParams({
      objectType: ObjectType.Language,
      searchString: 'chinese',
    });

    const result = getNewURLSearchParams({ objectType: ObjectType.Territory }, prev);

    expect(result.get('searchString')).toBeNull();
    expect(result.get('languageFilter')).toBe('chinese');
  });

  it('keep searchString to territoryFilter when switching from Territory', () => {
    const prev = new URLSearchParams({
      objectType: ObjectType.Territory,
      searchString: 'China',
    });
    const result = getNewURLSearchParams({ objectType: ObjectType.Language }, prev);
    expect(result.get('searchString')).toBeNull();
    expect(result.get('territoryFilter')).toBe('China');
  });

  it('keep searchString to writingSystemFilter when switching from WritingSystem', () => {
    const prev = new URLSearchParams({
      objectType: ObjectType.WritingSystem,
      searchString: 'Latin',
    });
    const result = getNewURLSearchParams({ objectType: ObjectType.Territory }, prev);
    expect(result.get('searchString')).toBeNull();
    expect(result.get('writingSystemFilter')).toBe('Latin');
  });

  it('keeps objectID when switching objectType', () => {
    const prev = new URLSearchParams({
      objectType: ObjectType.Language,
      searchString: 'chinese',
      objectID: '123',
    });
    const result = getNewURLSearchParams({ objectType: ObjectType.Territory }, prev);
    expect(result.get('objectID')).toBe('123');
  });

  it('clears page when view changes', () => {
    const prev = new URLSearchParams({
      view: 'Table',
      page: '3',
    });

    const result = getNewURLSearchParams({ view: View.Map }, prev);

    expect(result.get('page')).toBeNull();
  });

  it('does not migrate searchString when objectType does not change', () => {
    const prev = new URLSearchParams({
      objectType: ObjectType.Language,
      searchString: 'English',
    });

    const result = getNewURLSearchParams({ objectType: ObjectType.Language }, prev);

    expect(result.get('searchString')).toBe('English');
    expect(result.get('languageFilter')).toBeNull();
  });

  it('does not create a filter when searchString is missing', () => {
    const prev = new URLSearchParams({
      objectType: ObjectType.Language,
    });

    const result = getNewURLSearchParams({ objectType: ObjectType.Territory }, prev);

    expect(result.get('searchString')).toBeNull();
    expect(result.get('languageFilter')).toBeNull();
  });

  it('promotes previous sortBy to secondarySortBy when user changes primary sortBy', () => {
    const prev = new URLSearchParams({
      sortBy: Field.Population,
    });

    const result = getNewURLSearchParams({ sortBy: Field.VitalityMetascore }, prev);

    expect(result.get('sortBy')).toBe(Field.VitalityMetascore);
    expect(result.get('secondarySortBy')).toBe(Field.Population);
  });

  it('when new primary was the old secondary (A then B → user picks B), result is B then A', () => {
    const prev = new URLSearchParams({
      sortBy: Field.Population, // A
      secondarySortBy: Field.VitalityMetascore, // B
    });

    const result = getNewURLSearchParams({ sortBy: Field.VitalityMetascore }, prev);

    expect(result.get('sortBy')).toBe(Field.VitalityMetascore); // B
    expect(result.get('secondarySortBy')).toBe(Field.Population); // A (old primary), not B
  });

  it('does not set secondarySortBy when sortBy is unchanged', () => {
    const prev = new URLSearchParams({
      sortBy: Field.Population,
    });

    const result = getNewURLSearchParams({ sortBy: Field.Population }, prev);

    // sortBy may be removed when it equals default (Population); we only assert we did not promote to secondary
    expect(result.get('secondarySortBy')).toBeNull();
  });

  it('when user sets secondarySortBy to None only, URL has no secondarySortBy', () => {
    const prev = new URLSearchParams({
      sortBy: Field.Name, // non-default so it stays in URL
      secondarySortBy: Field.VitalityMetascore,
    });

    const result = getNewURLSearchParams({ secondarySortBy: Field.None }, prev);

    expect(result.get('sortBy')).toBe(Field.Name);
    // None is default so it is removed from URL
    expect(result.get('secondarySortBy')).toBeNull();
  });

  it('when user changes primary and sets secondary to None in same update, secondary stays None', () => {
    const prev = new URLSearchParams({
      sortBy: Field.Population,
      secondarySortBy: Field.VitalityMetascore,
    });

    const result = getNewURLSearchParams(
      { sortBy: Field.VitalityMetascore, secondarySortBy: Field.None },
      prev,
    );

    expect(result.get('sortBy')).toBe(Field.VitalityMetascore);
    // User explicitly chose None; must not be overwritten by old primary
    expect(result.get('secondarySortBy')).toBeNull();
  });
});
