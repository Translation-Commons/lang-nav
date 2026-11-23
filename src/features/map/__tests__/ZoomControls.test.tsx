import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import usePageParams from '@features/params/usePageParams';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import ZoomControls from '../ZoomControls';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));

const setShowMapBorders = vi.fn();

function renderControls(showMapBorders: boolean) {
  vi.mocked(usePageParams).mockReturnValue(
    createMockUsePageParams({ showMapBorders, setShowMapBorders }),
  );
  render(<ZoomControls zoomIn={vi.fn()} zoomOut={vi.fn()} resetView={vi.fn()} />);
}

describe('ZoomControls borders button', () => {
  beforeEach(() => setShowMapBorders.mockClear());

  it('offers to show borders when they are hidden', () => {
    renderControls(false);
    const button = screen.getByRole('button', { name: 'Show country borders' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(setShowMapBorders).toHaveBeenCalledWith(true);
  });

  it('offers to hide borders when they are shown', () => {
    renderControls(true);
    const button = screen.getByRole('button', { name: 'Hide country borders' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);
    expect(setShowMapBorders).toHaveBeenCalledWith(false);
  });
});
