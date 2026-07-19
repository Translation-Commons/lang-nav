import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Hoverable from '../Hoverable';

describe('Hoverable', () => {
  it('renders children directly when hoverContent is null or undefined', () => {
    render(<Hoverable>plain text</Hoverable>);
    expect(screen.getByText('plain text')).toBeInTheDocument();
    expect(screen.queryByTestId('hoverable')).not.toBeInTheDocument();
  });

  it('renders a trigger without needing a provider and labels string content for a11y', () => {
    render(<Hoverable hoverContent="tooltip text">hover me</Hoverable>);
    const trigger = screen.getByTestId('hoverable');
    expect(trigger).toHaveTextContent('hover me');
    expect(trigger).toHaveAttribute('aria-label', 'tooltip text');
    expect(trigger.className).toContain('cursor-help');
  });

  it('uses a pointer cursor when an onClick is provided', () => {
    render(
      <Hoverable hoverContent="t" onClick={() => {}}>
        clickable
      </Hoverable>,
    );
    expect(screen.getByTestId('hoverable').className).toContain('cursor-pointer');
  });

  it('forwards clicks to onClick and stops propagation', () => {
    const onClick = vi.fn();
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick}>
        <Hoverable hoverContent="t" onClick={onClick}>
          clickable
        </Hoverable>
      </div>,
    );
    fireEvent.click(screen.getByTestId('hoverable'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('reveals hoverContent on hover', async () => {
    const user = userEvent.setup();
    render(<Hoverable hoverContent={<span>rich preview</span>}>hover me</Hoverable>);
    await user.hover(screen.getByTestId('hoverable'));
    await waitFor(() => expect(screen.getByText('rich preview')).toBeInTheDocument());
  });
});
