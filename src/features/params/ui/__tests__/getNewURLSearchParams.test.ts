import { describe, expect, it } from 'vitest';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { ObjectType, View } from '@features/params/PageParamTypes';

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
});
