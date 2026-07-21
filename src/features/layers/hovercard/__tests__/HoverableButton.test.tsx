import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import HoverableButton from '../HoverableButton';

describe('HoverableButton', () => {
  it('renders a plain button when hoverContent is null or undefined', () => {
    render(<HoverableButton>Click me</HoverableButton>);
    const button = screen.getByText('Click me');
    expect(button.tagName).toBe('BUTTON');
  });

  it('preserves ariaLabel, className and button type', () => {
    render(
      <HoverableButton ariaLabel="Do it" className="custom" buttonType="submit">
        label
      </HoverableButton>,
    );
    const button = screen.getByRole('button', { name: 'Do it' });
    expect(button).toHaveClass('custom');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('forwards clicks to onClick', () => {
    const onClick = vi.fn();
    render(
      <HoverableButton hoverContent="tooltip" onClick={onClick}>
        clickable
      </HoverableButton>,
    );
    fireEvent.click(screen.getByText('clickable'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies pointer cursor with onClick and auto cursor without', () => {
    const { rerender } = render(
      <HoverableButton hoverContent="t" onClick={() => {}}>
        has click
      </HoverableButton>,
    );
    expect(screen.getByText('has click').className).toContain('cursor-pointer');

    rerender(<HoverableButton hoverContent="t">no click</HoverableButton>);
    expect(screen.getByText('no click').className).toContain('cursor-auto');
  });

  it('reveals hoverContent on hover', async () => {
    const user = userEvent.setup();
    render(<HoverableButton hoverContent="the tip">hover me</HoverableButton>);
    await user.hover(screen.getByText('hover me'));
    await waitFor(() => expect(screen.getByText('the tip')).toBeInTheDocument());
  });
});
