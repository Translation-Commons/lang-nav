import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PopupCard from '../PopupCard';

vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({ showHoverCard: vi.fn(), hideHoverCard: vi.fn() }),
}));

describe('PopupCard', () => {
  it('renders the button label', () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);
    expect(screen.getByText('Open Popup')).toBeInTheDocument();
  });

  it('opens the popup when the button is clicked', () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);
    fireEvent.click(screen.getByText('Open Popup'));
    expect(screen.getByText('Popup Title')).toBeInTheDocument();
    expect(screen.getByText('Popup content')).toBeInTheDocument();
  });

  it('closes the popup when the Escape key is pressed', () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);
    fireEvent.click(screen.getByText('Open Popup'));
    expect(screen.getByText('Popup Title')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Popup Title')).not.toBeInTheDocument();
  });

  it('closes the popup when the close button is clicked', () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);
    fireEvent.click(screen.getByText('Open Popup'));
    expect(screen.getByText('Popup Title')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByText('Popup Title')).not.toBeInTheDocument();
  });

  it('closes the popup when the opening button is clicked again', () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);
    fireEvent.click(screen.getByText('Open Popup'));
    expect(screen.getByText('Popup Title')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Open Popup'));
    expect(screen.queryByText('Popup Title')).not.toBeInTheDocument();
  });
});
