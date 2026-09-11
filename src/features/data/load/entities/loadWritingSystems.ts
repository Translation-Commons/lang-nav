import { EntityType } from '@features/params/PageParamTypes';

import { WritingSystemData, WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import { isApiEnabled } from '../api/apiConfig';
import { loadWritingSystemsFromApi } from '../api/loadWritingSystemsFromApi';

import { loadEntitiesFromFile } from './loadEntitiesFromFile';

export async function loadWritingSystems(): Promise<Record<string, WritingSystemData> | void> {
  if (isApiEnabled()) {
    const fromApi = await loadWritingSystemsFromApi();
    if (fromApi != null) {
      return fromApi;
    }
    console.warn('Writing system API load failed; falling back to TSV files.');
  }
  return await loadEntitiesFromFile<WritingSystemData>(
    'data/tc/writingSystems.tsv',
    parseWritingSystem,
  );
}

export function parseWritingSystem(line: string): WritingSystemData {
  const parts = line.split('\t');
  const nameEndonym = parts[3] || undefined;
  return {
    type: EntityType.WritingSystem,

    ID: parts[0],
    codeDisplay: parts[0],
    scope: parts[11] as WritingSystemScope,
    nameDisplay: parts[1],
    nameDisplayOriginal: parts[1],
    nameFull: parts[2],
    nameEndonym,
    names: [parts[1], parts[2], nameEndonym].filter((s) => s != null),
    unicodeVersion: parts[4] !== '' ? parseFloat(parts[4]) : undefined,
    sample: parts[5] || undefined,
    rightToLeft: parseBoolean(parts[6]),
    primaryLanguageCode: parts[7] || undefined,
    territoryOfOriginCode: parts[8] || undefined,
    parentWritingSystemCode: parts[9] || undefined,
    containsWritingSystemsCodes: parts[10] !== '' ? parts[10].split(', ') : [],
  };
}

/**
 * Parses the boolean spellings used across these TSV files, matching the
 * backend ETL's `to_bool` (backend/etl/sources.py) value-for-value.
 *
 * This used to compare against the literals 'Yes' and 'no' case-sensitively.
 * Today's writingSystems.tsv happens to use exactly those two spellings, so
 * both paths agreed, but a contributor typing 'No' would have made them
 * diverge silently: the API path would have said false and the TSV path
 * undefined, and right-to-left text would have rendered left-to-right with no
 * error anywhere. Anything outside these sets stays undefined, which is what
 * both paths already do for the blank and 'n/a' cells in the current file.
 */
function parseBoolean(value: string | undefined): boolean | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized == null || normalized === '') return undefined;
  if (['1', 'true', 'yes', 'y'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n'].includes(normalized)) return false;
  return undefined;
}
