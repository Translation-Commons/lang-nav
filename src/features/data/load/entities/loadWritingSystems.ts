import { ObjectType } from '@features/params/PageParamTypes';

import { WritingSystemData, WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import { loadObjectsFromFile } from './loadObjectsFromFile';

export async function loadWritingSystems(): Promise<Record<string, WritingSystemData> | void> {
  return await loadObjectsFromFile<WritingSystemData>(
    'data/writingSystems.tsv',
    parseWritingSystem,
  );
}

export function parseWritingSystem(line: string): WritingSystemData {
  const parts = line.split('\t');
  const nameEndonym = parts[3] || undefined;
  return {
    type: ObjectType.WritingSystem,

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
    rightToLeft: parts[6] === 'Yes' ? true : parts[6] === 'no' ? false : undefined,
    primaryLanguageCode: parts[7] || undefined,
    territoryOfOriginCode: parts[8] || undefined,
    parentWritingSystemCode: parts[9] || undefined,
    containsWritingSystemsCodes: parts[10] !== '' ? parts[10].split(', ') : [],
  };
}
