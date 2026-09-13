import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ApiToggle from '../ApiToggle';

describe('ApiToggle', () => {
  let reloadSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    reloadSpy = vi.fn();
    // jsdom throws "Not implemented: navigation" on a real reload; the toggle
    // only needs to know reload was requested, not to actually navigate.
    vi.stubGlobal('location', { ...window.location, reload: reloadSpy });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('renders nothing when the build never configured an API URL', () => {
    vi.stubEnv('VITE_API_URL', '');

    const { container } = render(<ApiToggle />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows files as the default, unpressed state when no override has ever been set', () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');

    render(<ApiToggle />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Files')).toBeInTheDocument();
  });

  it('shows the API as pressed/on once explicitly switched on', () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    localStorage.setItem('langnav:apiOverride', 'on');

    render(<ApiToggle />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('API')).toBeInTheDocument();
  });

  it('switching on from the default stores the override and reloads the page', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');

    render(<ApiToggle />);
    await userEvent.click(screen.getByRole('button'));

    expect(localStorage.getItem('langnav:apiOverride')).toBe('on');
    expect(reloadSpy).toHaveBeenCalledOnce();
  });

  it('switching back off stores the override and reloads the page', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
    localStorage.setItem('langnav:apiOverride', 'on');

    render(<ApiToggle />);
    await userEvent.click(screen.getByRole('button'));

    expect(localStorage.getItem('langnav:apiOverride')).toBe('off');
    expect(reloadSpy).toHaveBeenCalledOnce();
  });
});
