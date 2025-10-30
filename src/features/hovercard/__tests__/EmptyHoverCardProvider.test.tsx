import { describe, it, expect } from 'vitest';

import { reactNodeToString } from '@shared/lib/stringExportUtils';

import EmptyHoverCardProvider from '../EmptyHoverCardProvider';
import Hoverable from '../Hoverable';

describe('EmptyHoverCardProvider', () => {
  it('using reactNodeToString on a Hoverable requires an empty provider to avoid context errors', () => {
    const hoverableContent = <Hoverable hoverContent={<div>content</div>}>hover me</Hoverable>;

    expect(() => reactNodeToString(hoverableContent)).toThrow(Error);

    expect(
      reactNodeToString(<EmptyHoverCardProvider>{hoverableContent}</EmptyHoverCardProvider>),
    ).toBe('hover me');
  });
});
