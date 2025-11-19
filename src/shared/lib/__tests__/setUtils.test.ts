import { describe, expect, it } from 'vitest';

import { uniqueBy } from '../setUtils';

describe('uniqueBy', () => {
  it('returns unique items based on key function', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' },
      { id: 3, name: 'Charlie' },
    ];
    const uniqueItems = uniqueBy(items, (item) => item.id);
    expect(uniqueItems).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]);
  });

  it('stable to input order', () => {
    const items = [
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ];
    const uniqueItems = uniqueBy(items, (item) => item.id);
    expect(uniqueItems).toEqual([
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' },
      { id: 3, name: 'Charlie' },
    ]);
  });
});
