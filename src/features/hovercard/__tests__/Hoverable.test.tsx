import { render, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import Hoverable from '../Hoverable';

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

describe('Hoverable', () => {
  it('renders children when hoverContent is null or undefined', () => {
    const { getByText } = render(<Hoverable>plain text</Hoverable>);
    expect(getByText('plain text')).toBeTruthy();
    // ensure the hook was not invoked
    expect(showHoverCard).not.toHaveBeenCalled();
  });

  it('calls showHoverCard with the provided content and coordinates on mouse enter', () => {
    const { getByTestId } = render(<Hoverable hoverContent="tooltip text">hover me</Hoverable>);

    const el = getByTestId('hoverable');
    fireEvent.mouseEnter(el, { clientX: 12, clientY: 34 });

    expect(showHoverCard).toHaveBeenCalledTimes(1);
    expect(showHoverCard).toHaveBeenCalledWith('tooltip text', 12, 34);
  });

  it('calls onMouseLeaveTriggeringElement on mouse leave', () => {
    const { getByTestId } = render(<Hoverable hoverContent="tooltip">hover me</Hoverable>);
    const el = getByTestId('hoverable');
    fireEvent.mouseLeave(el);
    expect(onMouseLeaveTriggeringElement).toHaveBeenCalledTimes(1);
  });

  it('hides hover card and forwards click to onClick handler when clicked', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(
      <Hoverable hoverContent="tooltip" onClick={onClick}>
        clickable
      </Hoverable>,
    );

    const el = getByTestId('hoverable');
    fireEvent.click(el);

    expect(hideHoverCard).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies pointer cursor when onClick provided and help cursor when not', () => {
    const { getByText: getWithClick } = render(
      <Hoverable hoverContent="t" onClick={() => {}}>
        clickable
      </Hoverable>,
    );
    expect(getWithClick('clickable').getAttribute('style')).toContain('cursor: pointer');

    const { getByText: getNoClick } = render(<Hoverable hoverContent="t">no click</Hoverable>);
    expect(getNoClick('no click').getAttribute('style')).toContain('cursor: help');
  });
});
