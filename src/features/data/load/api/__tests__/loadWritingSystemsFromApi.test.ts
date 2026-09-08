import { afterEach, describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import {
  ApiWritingSystem,
  loadWritingSystemsFromApi,
  parseApiWritingSystem,
} from '../loadWritingSystemsFromApi';

/**
 * These test the mapping only, against fixtures shaped exactly like the API's
 * JSON. They need no network and no database.
 *
 * Whether the mapping AGREES with the TSV path is a different question, and
 * one a unit test cannot answer: that is the field-by-field diff across every
 * writing system, which needs both paths and a running backend - see
 * `loadWritingSystemsParity.test.ts`.
 */

/** A root writing system: no parent, no group members, no endonym. */
const egyp: ApiWritingSystem = {
  id: 'Egyp',
  scope: WritingSystemScope.IndividualScript,
  name_full: 'Egyptian hieroglyphs',
  unicode_version: 5.2,
  sample: '𓅓',
  right_to_left: false,
  primary_language_id: 'egy',
  territory_of_origin_id: 'EG',
  parent_writing_system_id: null,
  entity: { name_display: 'Egyptian hieroglyphs', name_endonym: null },
  writing_system_contains: [],
};

/** A group with three members, to exercise the embed. Real data: Jpan
 *  contains exactly Han, Hiragana and Katakana. */
const jpan: ApiWritingSystem = {
  id: 'Jpan',
  scope: WritingSystemScope.Group,
  name_full: 'Japanese (alias for Han + Hiragana + Katakana)',
  unicode_version: 1.1,
  sample: null,
  right_to_left: null,
  primary_language_id: null,
  territory_of_origin_id: 'JP',
  parent_writing_system_id: null,
  entity: { name_display: 'Japanese scripts', name_endonym: null },
  writing_system_contains: [{ child_id: 'Hani' }, { child_id: 'Hira' }, { child_id: 'Kana' }],
};

/** Has a parent (derivation lineage) and an endonym. */
const cyrl: ApiWritingSystem = {
  id: 'Cyrl',
  scope: WritingSystemScope.IndividualScript,
  name_full: 'Cyrillic',
  unicode_version: 1.1,
  sample: 'Б',
  right_to_left: false,
  primary_language_id: null,
  territory_of_origin_id: null,
  parent_writing_system_id: 'Grek',
  entity: { name_display: 'Cyrillic', name_endonym: 'кириллица' },
  writing_system_contains: [],
};

describe('parseApiWritingSystem', () => {
  it('maps the identity fields', () => {
    const ws = parseApiWritingSystem(egyp);
    expect(ws.type).toBe(EntityType.WritingSystem);
    expect(ws.ID).toBe('Egyp');
    expect(ws.codeDisplay).toBe('Egyp');
    expect(ws.scope).toBe(WritingSystemScope.IndividualScript);
    expect(ws.nameDisplay).toBe('Egyptian hieroglyphs');
    expect(ws.nameFull).toBe('Egyptian hieroglyphs');
    expect(ws.primaryLanguageCode).toBe('egy');
    expect(ws.territoryOfOriginCode).toBe('EG');
  });

  // name_display_original exists as a column but the ETL never writes to it,
  // so it's always NULL - parseWritingSystem sets this to nameDisplay instead
  // of a separate source value, and this mapper has to do the same.
  it('sets nameDisplayOriginal to the same value as nameDisplay', () => {
    const ws = parseApiWritingSystem(cyrl);
    expect(ws.nameDisplayOriginal).toBe(ws.nameDisplay);
    expect(ws.nameDisplayOriginal).toBe('Cyrillic');
  });

  it('flattens the writing_system_contains embed into containsWritingSystemsCodes', () => {
    expect(parseApiWritingSystem(jpan).containsWritingSystemsCodes).toEqual([
      'Hani',
      'Hira',
      'Kana',
    ]);
  });

  it('gives a writing system with no group members an empty array, not undefined', () => {
    expect(parseApiWritingSystem(egyp).containsWritingSystemsCodes).toEqual([]);
  });

  it('maps parentWritingSystemCode directly, with no transform', () => {
    expect(parseApiWritingSystem(cyrl).parentWritingSystemCode).toBe('Grek');
    expect(parseApiWritingSystem(egyp).parentWritingSystemCode).toBeUndefined();
  });

  // parseWritingSystem uses `!= null`, not a truthy check, so it would keep an
  // empty string here - this mapper has to use the same filter, not the
  // "more correct" one.
  it('builds names with `!= null`, not a truthy filter', () => {
    expect(parseApiWritingSystem(cyrl).names).toEqual(['Cyrillic', 'Cyrillic', 'кириллица']);
    expect(parseApiWritingSystem(egyp).names).toEqual([
      'Egyptian hieroglyphs',
      'Egyptian hieroglyphs',
    ]);
  });

  // parseWritingSystem has no `|| undefined` fallback for this one column, so
  // a blank cell comes out as '', not absent - matching that here instead of
  // dropping it to undefined like every other nullable field.
  it('turns a null name_full into an empty string, not undefined', () => {
    const ws = parseApiWritingSystem({ ...egyp, name_full: null });
    expect(ws.nameFull).toBe('');
    expect(ws.names).toContain('');
  });

  it('converts every other absent value to undefined, never null', () => {
    const ws = parseApiWritingSystem(egyp);
    for (const value of [ws.nameEndonym, ws.parentWritingSystemCode]) {
      expect(value).toBeUndefined();
      expect(value).not.toBeNull();
    }
  });

  it('maps the right_to_left tri-state directly', () => {
    expect(parseApiWritingSystem(egyp).rightToLeft).toBe(false);
    expect(parseApiWritingSystem({ ...egyp, right_to_left: true }).rightToLeft).toBe(true);
    expect(parseApiWritingSystem({ ...egyp, right_to_left: null }).rightToLeft).toBeUndefined();
  });

  it('never sends the derived population fields', () => {
    const ws = parseApiWritingSystem(jpan);
    expect(ws.populationUpperBound).toBeUndefined();
    expect(ws.populationOfDescendants).toBeUndefined();
  });
});

/**
 * Regression, same contract every API loader must honor. CoreData.tsx awaits
 * every loader in one Promise.all and then checks the results for null,
 * alerting if any is missing. A loader that REJECTS skips that check: the
 * whole Promise.all rejects and the app sits stuck with the cause visible only
 * in the console.
 */
describe('loadWritingSystemsFromApi failure handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('resolves to undefined rather than rejecting when the API is unreachable', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );

    await expect(loadWritingSystemsFromApi()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('resolves to undefined rather than rejecting on a non-200', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 503, statusText: 'Service Unavailable' } as Response),
      ),
    );

    await expect(loadWritingSystemsFromApi()).resolves.toBeUndefined();
  });
});
