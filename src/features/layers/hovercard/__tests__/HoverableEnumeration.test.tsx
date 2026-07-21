import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HoverableEnumeration from '../HoverableEnumeration';

describe('HoverableEnumeration', () => {
  it('renders Deemphasized text when items is empty or undefined', () => {
    const { getByText, queryByText, rerender } = render(<HoverableEnumeration items={[]} />);
    expect(getByText('0')).toBeTruthy();

    rerender(<HoverableEnumeration items={undefined} />);
    expect(queryByText('0')).toBeNull();
  });

  it('renders the count as a hoverable trigger', () => {
    const items = ['Item 1', 'Item 2', 'Item 3'];
    const { getByText, getByTestId } = render(<HoverableEnumeration items={items} />);
    expect(getByText('3')).toBeTruthy();
    expect(getByTestId('hoverable')).toHaveTextContent('3');
  });

  it('renders the count for a long list too', () => {
    const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
    const { getByText } = render(<HoverableEnumeration items={items} limit={5} />);
    expect(getByText('20')).toBeTruthy();
  });
});
