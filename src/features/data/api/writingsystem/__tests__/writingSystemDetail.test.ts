import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedEntities } from '@features/__tests__/MockEntities';

import { EntityType } from '@entities/types/EntityTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { toWritingSystemDetail } from '../writingSystemDetail';

const writingSystems = Object.values(getFullyInstantiatedMockedEntities()).filter(
  (e): e is WritingSystemData => e.type === EntityType.WritingSystem,
);

describe('toWritingSystemDetail', () => {
  it('is plain JSON', () => {
    for (const ws of writingSystems) {
      const detail = toWritingSystemDetail(ws, { id: ws.ID, sortBy: 'Name', sortBehavior: '1' });
      expect(JSON.parse(JSON.stringify(detail))).toEqual(detail);
    }
  });

  it('orders lists by the query sort, and reverses with sortBehavior', () => {
    const ws = writingSystems.find((w) => Object.keys(w.languages ?? {}).length > 1)!;
    const names = (sortBehavior: string) =>
      toWritingSystemDetail(ws, { id: ws.ID, sortBy: 'Name', sortBehavior }).languages.map(
        (l) => l.name,
      );
    expect(names('1')).toEqual([...names('1')].sort());
    expect(names('-1')).toEqual([...names('1')].reverse());
  });

  it('does not reorder the entity lists it reads', () => {
    const ws = writingSystems[0];
    const before = Object.keys(ws.languages ?? {});
    toWritingSystemDetail(ws, { id: ws.ID, sortBy: 'Name', sortBehavior: '-1' });
    expect(Object.keys(ws.languages ?? {})).toEqual(before);
  });
});
