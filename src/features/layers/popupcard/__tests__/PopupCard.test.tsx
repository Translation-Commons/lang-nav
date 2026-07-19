import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PopupCard from '../PopupCard';

const openPopup = async () => {
  fireEvent.click(screen.getByText('Open Popup'));
  return screen.findByText('Popup Title');
};

describe('PopupCard', () => {
  it('renders the button label', () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);
    expect(screen.getByText('Open Popup')).toBeInTheDocument();
  });

  it('opens the popup when the button is clicked', async () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);
    await openPopup();
    expect(screen.getByText('Popup content')).toBeInTheDocument();
  });

  it('supports a lazy body thunk', async () => {
    render(
      <PopupCard buttonLabel="Open Popup" title="Popup Title" body={() => <p>Lazy body</p>} />,
    );
    await openPopup();
    expect(screen.getByText('Lazy body')).toBeInTheDocument();
  });

  it('stays open while interacting with content inside it (sort-key canary)', async () => {
    render(
      <PopupCard
        buttonLabel="Open Popup"
        title="Popup Title"
        body={<button type="button">Sort key</button>}
      />,
    );
    const title = await openPopup();
    fireEvent.click(screen.getByText('Sort key'));
    expect(title).toBeInTheDocument();
  });

  it('closes the popup when the Escape key is pressed', async () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);
    const title = await openPopup();
    fireEvent.keyDown(title, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByText('Popup Title')).not.toBeInTheDocument());
  });

  it('closes the popup when the close button is clicked', async () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);
    await openPopup();
    fireEvent.click(screen.getByLabelText('Close'));
    await waitFor(() => expect(screen.queryByText('Popup Title')).not.toBeInTheDocument());
  });

  it('closes the popup when the opening button is pressed again', async () => {
    render(<PopupCard buttonLabel="Open Popup" title="Popup Title" body={<p>Popup content</p>} />);
    await openPopup();
    fireEvent.click(screen.getByText('Open Popup'));
    await waitFor(() => expect(screen.queryByText('Popup Title')).not.toBeInTheDocument());
  });
});
