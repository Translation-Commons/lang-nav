import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModalButton from '../ModalButton';

vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({ showHoverCard: vi.fn(), hideHoverCard: vi.fn() }),
}));

describe('ModalButton', () => {
  it('renders a button but not the modal if it has not been opened', () => {
    render(
      <ModalButton buttonLabel="Open Modal" title="Modal title" body={<p>Modal content</p>} />,
    );

    expect(screen.getByText('Open Modal')).toBeInTheDocument();
    expect(screen.queryByText('Modal title')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('opens the modal when the button is clicked', () => {
    render(
      <ModalButton buttonLabel="Open Modal" title="Modal title" body={<p>Modal content</p>} />,
    );

    expect(screen.getByText('Open Modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Open Modal'));
    expect(screen.getByText('Modal title')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });
});
