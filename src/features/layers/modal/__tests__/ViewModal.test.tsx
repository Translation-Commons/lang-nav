import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ViewModal from '../ViewModal';

vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({ showHoverCard: vi.fn(), hideHoverCard: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('ViewModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <ViewModal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </ViewModal>,
    );

    expect(screen.queryByText('Test Modal')).toBeNull();
    expect(screen.queryByText('Modal content')).toBeNull();
  });

  it('renders title and children when isOpen is true', () => {
    render(
      <ViewModal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </ViewModal>,
    );

    expect(screen.getByText('Test Modal')).toBeTruthy();
    expect(screen.getByText('Modal content')).toBeTruthy();
  });

  it('renders with aria-modal and dialog role', () => {
    render(
      <ViewModal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </ViewModal>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ViewModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </ViewModal>,
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <ViewModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </ViewModal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when clicking outside the modal', () => {
    const onClose = vi.fn();
    render(
      <ViewModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </ViewModal>,
    );

    // mousedown on the overlay (outside the modal)
    const overlay = screen.getByText('Test Modal').closest('.ModalOverlay')!;
    fireEvent.mouseDown(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('applies bodyStyle to the modal body', () => {
    render(
      <ViewModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal"
        bodyStyle={{ maxWidth: 'none', padding: '2em' }}
      >
        <p>Content</p>
      </ViewModal>,
    );

    const body = screen.getByText('Content').closest('.ModalBody') as HTMLElement;
    expect(body.style.maxWidth).toBe('none');
    expect(body.style.padding).toBe('2em');
  });
});
