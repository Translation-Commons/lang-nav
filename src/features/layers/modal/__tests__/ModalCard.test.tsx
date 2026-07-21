import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModalCard from '../ModalCard';

afterEach(cleanup);

describe('ModalCard', () => {
  it('renders title and children', () => {
    render(
      <ModalCard onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </ModalCard>,
    );
    expect(screen.getByText('Test Modal')).toBeTruthy();
    expect(screen.getByText('Modal content')).toBeTruthy();
  });

  it('renders with a dialog role', () => {
    render(
      <ModalCard onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </ModalCard>,
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ModalCard onClose={onClose} title="Test Modal">
        <p>Content</p>
      </ModalCard>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();
    render(
      <ModalCard onClose={onClose} title="Test Modal">
        <p>Content</p>
      </ModalCard>,
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('applies bodyStyle to the modal body', () => {
    render(
      <ModalCard
        onClose={vi.fn()}
        title="Test Modal"
        bodyStyle={{ maxWidth: 'none', padding: '2em' }}
      >
        <p>Content</p>
      </ModalCard>,
    );
    const body = screen.getByTestId('modal-body');
    expect(body.style.maxWidth).toBe('none');
    expect(body.style.padding).toBe('2em');
  });
});
