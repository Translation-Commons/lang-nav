import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PopupCard from '../PopupCard';

vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({ showHoverCard: vi.fn(), hideHoverCard: vi.fn() }),
}));

describe('PopupCard', () => {
  it('renders the button label and popup content structure', () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);

    expect(screen.getByRole('button', { name: 'Open Popup' })).toBeVisible();
    expect(screen.getByRole('dialog')).toHaveClass('popupCard', 'popupCardAlign-right');
    expect(screen.getByText('Popup Title')).toBeInTheDocument();
    expect(screen.getByText('Popup content')).toBeInTheDocument();
  });

  it('uses focus within the container to drive popup visibility', () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);

    const button = screen.getByRole('button', { name: 'Open Popup' });
    const container = button.closest('.popupContainer');

    expect(container).not.toBeNull();
    expect(container).not.toContainElement(document.activeElement as HTMLElement | null);

    button.focus();

    expect(button).toHaveFocus();
    expect(container).toContainElement(document.activeElement as HTMLElement | null);
  });

  it('clicking the toggle focuses the button and keeps the popup mounted', () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);

    const button = screen.getByRole('button', { name: 'Open Popup' });

    fireEvent.click(button);
    button.focus();

    expect(button).toHaveFocus();
    expect(screen.getByRole('dialog')).toContainElement(screen.getByText('Popup Title'));
    expect(screen.getByRole('dialog')).toContainElement(screen.getByText('Popup content'));
  });

  it('stops matching the focus-driven visible state when focus leaves the container', () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);

    const button = screen.getByRole('button', { name: 'Open Popup' });
    const container = button.closest('.popupContainer');

    expect(container).not.toBeNull();

    button.focus();
    expect(container).toContainElement(document.activeElement as HTMLElement | null);

    button.blur();

    expect(button).not.toHaveFocus();
    expect(container).not.toContainElement(document.activeElement as HTMLElement | null);
  });
});
