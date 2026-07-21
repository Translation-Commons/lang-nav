import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModalButton from '../ModalButton';

describe('ModalButton', () => {
  it('renders a button but not the modal if it has not been opened', () => {
    render(
      <ModalButton buttonLabel="Open Modal" title="Modal title" body={<p>Modal content</p>} />,
    );
    expect(screen.getByText('Open Modal')).toBeInTheDocument();
    expect(screen.queryByText('Modal title')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('opens the modal when the button is clicked', async () => {
    render(
      <ModalButton buttonLabel="Open Modal" title="Modal title" body={<p>Modal content</p>} />,
    );
    fireEvent.click(screen.getByText('Open Modal'));
    expect(await screen.findByText('Modal title')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });
});
