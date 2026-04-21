import { ObjectType } from '@features/params/PageParamTypes';

import {
  KeyboardData,
  KeyboardDictionary,
  KeyboardPlatform,
} from '@entities/keyboard/KeyboardTypes';

import { loadObjectsFromFile } from './loadObjectsFromFile';

export async function loadKeyboardsKeyman(): Promise<KeyboardDictionary | void> {
  return await loadObjectsFromFile<KeyboardData>('data/keyman/keyman.tsv', parseKeyboardKeymanLine);
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
    type: ObjectType.Keyboard,
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
