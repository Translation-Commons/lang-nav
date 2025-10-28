import { render, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import Hoverable from '../Hoverable';
import HoverableButton from '../HoverableButton';
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

describe('HoverableButton', () => {
  it('renders a button with children when hoverContent is null or undefined', () => {
    const { getByText } = render(<HoverableButton>Click me</HoverableButton>);
    const button = getByText('Click me');
    expect(button).toBeTruthy();
    expect(button.tagName).toBe('BUTTON');
    // ensure the hook was not invoked
    expect(showHoverCard).not.toHaveBeenCalled();
  });

  it('calls showHoverCard with the provided content and coordinates on mouse enter and move', () => {
    const { getByText } = render(
      <HoverableButton hoverContent="tooltip text">hover me</HoverableButton>,
    );

    const button = getByText('hover me');
    fireEvent.mouseEnter(button, { clientX: 20, clientY: 30 });
    expect(showHoverCard).toHaveBeenCalledWith('tooltip text', 20, 30);

    fireEvent.mouseMove(button, { clientX: 25, clientY: 35 });
    expect(showHoverCard).toHaveBeenCalledWith('tooltip text', 25, 35);
  });

  it('calls hideHoverCard on mouse leave', () => {
    const { getByText } = render(
      <HoverableButton hoverContent="tooltip text">hover me</HoverableButton>,
    );

    const button = getByText('hover me');
    fireEvent.mouseLeave(button);
    expect(hideHoverCard).toHaveBeenCalledTimes(1);
  });

  it('hides hover card and forwards click to onClick handler when clicked', () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <HoverableButton hoverContent="tooltip" onClick={onClick}>
        clickable
      </HoverableButton>,
    );

    const button = getByText('clickable');
    fireEvent.click(button);

    expect(hideHoverCard).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies pointer cursor when onClick provided and auto cursor when not', () => {
    const { getByText: getWithClick } = render(
      <HoverableButton hoverContent="t" onClick={() => {}}>
        has click
      </HoverableButton>,
    );
    expect(getWithClick('has click').getAttribute('style')).toContain('cursor: pointer');

    const { getByText: getNoClick } = render(
      <HoverableButton hoverContent="t">no click</HoverableButton>,
    );
    expect(getNoClick('no click').getAttribute('style')).toContain('cursor: auto');
  });
});
