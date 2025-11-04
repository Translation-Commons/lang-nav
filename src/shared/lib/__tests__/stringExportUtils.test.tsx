import { describe, it, expect } from 'vitest';

import { csvEscape, reactNodeToString } from '../stringExportUtils';

describe('stringExportUtils module', () => {
  it('csvEscape: leaves simple strings unchanged and alters strings with comma or quote', () => {
    expect(csvEscape('simple')).toBe('simple');

    const withComma = csvEscape('a,b');
    expect(withComma).toBe('"a,b"');

    const withQuote = csvEscape('he said "hi"');
    expect(withQuote).toBe('"he said ""hi"""');
  });

  it('reactNodeToString: converts React nodes to plain text', () => {
    // Simple text node
    expect(reactNodeToString('Hello World')).toBe('Hello World');

    // Nested elements
    const nestedNode = (
      <div>
        Hello <strong>World</strong>!
      </div>
    );
    expect(reactNodeToString(nestedNode)).toBe('Hello World!');

    // Element with multiple children
    const multiChildNode = (
      <span>
        This is <em>important</em> and <u>underlined</u>.
      </span>
    );
    expect(reactNodeToString(multiChildNode)).toBe('This is important and underlined.');

    // Null and undefined
    expect(reactNodeToString(null)).toBe('');
    expect(reactNodeToString(undefined)).toBe('');
  });
});
