import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ZoomControls from '../ZoomControls';

const zoomHandlers = { zoomIn: vi.fn(), zoomOut: vi.fn(), resetTransform: vi.fn() };

afterEach(cleanup);

describe('ZoomControls country names button', () => {
  it('is not shown on maps that do not offer country names', () => {
    render(<ZoomControls {...zoomHandlers} />);
    expect(screen.queryByRole('button', { name: /country names/ })).toBeNull();
  });

  it('offers to hide the names while they are shown', () => {
    render(<ZoomControls {...zoomHandlers} countryNames={{ isShown: true, toggle: vi.fn() }} />);
    const button = screen.getByRole('button', { name: 'Hide country names' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('offers to show the names while they are hidden', () => {
    render(<ZoomControls {...zoomHandlers} countryNames={{ isShown: false, toggle: vi.fn() }} />);
    const button = screen.getByRole('button', { name: 'Show country names' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('toggles the names when clicked', () => {
    const toggle = vi.fn();
    render(<ZoomControls {...zoomHandlers} countryNames={{ isShown: true, toggle }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hide country names' }));
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});
