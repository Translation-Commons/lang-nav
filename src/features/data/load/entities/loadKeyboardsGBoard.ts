import { EntityType } from '@features/params/PageParamTypes';

import {
  KeyboardData,
  KeyboardDictionary,
  KeyboardPlatform,
} from '@entities/keyboard/KeyboardTypes';

import { isApiEnabled } from '../api/apiConfig';
import { loadKeyboardsFromApi } from '../api/loadKeyboardsFromApi';

import { loadEntitiesFromFile } from './loadEntitiesFromFile';

/**
 * With the API on this returns EVERY keyboard, Keyman included, because both
 * platforms are rows of one `keyboard` table and one request covers them.
 * `loadKeyboardsKeyman` then returns nothing, so CoreData's spread still sees
 * each keyboard exactly once. The split into two functions is a shape the TSV
 * files impose - one file per platform - not one the database has.
 *
 * On an API failure this falls back to the file, matching writing systems
 * rather than territory/language/locale: a missing keyboard degrades a detail
 * panel, it does not invalidate the page, so blocking the whole load with
 * CoreData's "Error loading data" alert would be the wrong trade. Note the
 * fallback yields GBoard ONLY, since that is what this file holds - Keyman
 * arrives from its own loader, which falls back independently.
 */
export async function loadKeyboardsGBoard(): Promise<KeyboardDictionary | void> {
  if (isApiEnabled()) {
    const fromApi = await loadKeyboardsFromApi();
    if (fromApi != null) {
      return fromApi;
    }
    console.warn('Keyboard API load failed; falling back to TSV files.');
  }
  return await loadEntitiesFromFile<KeyboardData>(
    'data/google/gboards.tsv',
    parseKeyboardGBoardLine,
  );
}

export function parseKeyboardGBoardLine(line: string): KeyboardData | undefined {
  if (line.startsWith('#') || line.startsWith('ID') || line.trim() === '') return undefined;

  const parts = line.split('\t');
  const id = parts[0];
  const nameDisplay = parts[1];
  const languageCode = parts[2];
  const territoryCode = parts[3] !== '' ? parts[3] : undefined;
  const inputScriptCode = parts[4];
  const outputScriptCode = parts[5];
  const variantCode = parts[6] !== '' ? parts[6] : undefined;

  return {
    type: EntityType.Keyboard,
    ID: id,
    codeDisplay: id,
    nameDisplay,
    names: [nameDisplay],
    platform: KeyboardPlatform.GBoard,
    languageCodes: [languageCode],
    territoryCode,
    inputScriptCode,
    outputScriptCode,
    variantCode,
  };
}
