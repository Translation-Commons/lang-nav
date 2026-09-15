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
 * Returns nothing when the API is on and reachable: `loadKeyboardsGBoard` has
 * already fetched Keyman's rows in the same request, and returning them again
 * would just hand CoreData a second copy to spread over the first.
 *
 * It still has to ASK, rather than short-circuit on `isApiEnabled()` alone,
 * because the two loaders fall back independently. If the request failed,
 * GBoard served its file and this must serve its own or Keyman's 1,085
 * keyboards would vanish - the one case where doing nothing here is wrong.
 *
 * Asking twice costs one request, not two: `loadKeyboardsFromApi` holds the
 * in-flight promise, and CoreData starts both loaders in the same
 * `Promise.all`, so this await joins the request its sibling already started
 * rather than racing a second one against it.
 */
export async function loadKeyboardsKeyman(): Promise<KeyboardDictionary | void> {
  if (isApiEnabled()) {
    const fromApi = await loadKeyboardsFromApi();
    if (fromApi != null) {
      return {};
    }
    console.warn('Keyboard API load failed; falling back to TSV files.');
  }
  return await loadEntitiesFromFile<KeyboardData>(
    'data/keyman/keyboards.tsv',
    parseKeyboardKeymanLine,
  );
}

export function parseKeyboardKeymanLine(line: string): KeyboardData | undefined {
  if (line.startsWith('#') || line.startsWith('ID') || line.trim() === '') return undefined;

  const parts = line.split('\t');
  const id = parts[0];
  const nameDisplay = parts[1];
  const langCodesRaw = parts[2];
  const inputScriptCode = parts[3];
  const outputScriptCode = parts[4];
  const downloads = parts[5] !== '' ? Number(parts[5]) : undefined;
  const totalDownloads = parts[6] !== '' ? Number(parts[6]) : undefined;
  const platformSupport =
    parts[7] !== ''
      ? parts[7]
          .trim()
          .split(',')
          .map((p) => p.trim())
      : undefined;

  const languageCodes = langCodesRaw !== '' ? langCodesRaw.split(',') : [];

  return {
    type: EntityType.Keyboard,
    ID: id,
    codeDisplay: id,
    nameDisplay,
    names: [nameDisplay],
    platform: KeyboardPlatform.Keyman,
    languageCodes,
    inputScriptCode,
    outputScriptCode,
    downloads,
    totalDownloads,
    platformSupport,
  };
}
