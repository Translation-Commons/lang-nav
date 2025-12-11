import { render, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import HoverableEnumeration from '../HoverableEnumeration';

// Mock the hook used by the components
const showHoverCard = vi.fn();
const hideHoverCard = vi.fn();
const onMouseLeaveTriggeringElement = vi.fn();

vi.mock('../useHoverCard', () => ({
  __esModule: true,
  default: () => ({
    showHoverCard,
    hideHoverCard,
    onMouseLeaveTriggeringElement,
  }),
}));

beforeEach(() => {
  showHoverCard.mockClear();
  hideHoverCard.mockClear();
  onMouseLeaveTriggeringElement.mockClear();
});

describe('HoverableEnumeration', () => {
  it('renders Deemphasized text when items is empty or undefined', () => {
    const { getByText, rerender } = render(<HoverableEnumeration items={[]} />);
    expect(getByText('0')).toBeTruthy();

    rerender(<HoverableEnumeration items={undefined} />);
    expect(() => getByText('0')).toThrowError();
    // ensure the hook was not invoked
    expect(showHoverCard).not.toHaveBeenCalled();
  });

  it('renders items and shows hover card on mouse events', () => {
    const items = ['Item 1', 'Item 2', 'Item 3'];
    const { getByText } = render(<HoverableEnumeration items={items} />);

    const itemElement = getByText('3');
    fireEvent.mouseEnter(itemElement, { clientX: 10, clientY: 20 });
    expect(showHoverCard).toHaveBeenCalledWith('Item 1, Item 2, Item 3', 10, 20);

    fireEvent.mouseLeave(itemElement);
    expect(onMouseLeaveTriggeringElement).toHaveBeenCalledTimes(1);
  });

  it('cuts off items when there are too many', () => {
    const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
    const { getByText } = render(<HoverableEnumeration items={items} limit={5} />);

    const itemElement = getByText('20');
    fireEvent.mouseEnter(itemElement, { clientX: 5, clientY: 15 });
    expect(showHoverCard).toHaveBeenCalledWith('Item 1, Item 2, Item 3, Item 4, Item 5...', 5, 15);
  });
});
