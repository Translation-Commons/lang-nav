import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import usePageParams from '@features/params/usePageParams';

import { PageBrightnessPreference } from '@shared/hooks/usePageBrightness';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import ThemeToggle from '../ThemeToggle';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));

describe('ThemeToggle', () => {
  let setPreference: Mock;

  const renderWith = (preference: PageBrightnessPreference) => {
    setPreference = vi.fn();
    (usePageParams as Mock).mockReturnValue({
      ...createMockUsePageParams(),
      brightness: { preference, setPreference, pageBrightness: 'light' },
    });
    render(<ThemeToggle />);
  };

  beforeEach(() => vi.clearAllMocks());

  it("shows the app's 'follow device' preference as the system option", () => {
    renderWith('follow device');

    expect(screen.getByRole('button', { name: 'System theme' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('shows an explicit preference as that option', () => {
    renderWith('dark');

    expect(screen.getByRole('button', { name: 'Dark theme' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it("stores the system option as 'follow device'", async () => {
    renderWith('light');

    await userEvent.click(screen.getByRole('button', { name: 'System theme' }));

    expect(setPreference).toHaveBeenCalledWith('follow device');
  });

  it('stores a directly picked brightness', async () => {
    renderWith('follow device');

    await userEvent.click(screen.getByRole('button', { name: 'Dark theme' }));

    expect(setPreference).toHaveBeenCalledWith('dark');
  });
});
