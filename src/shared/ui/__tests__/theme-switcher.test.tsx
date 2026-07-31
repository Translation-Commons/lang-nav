import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ThemeSwitcher } from '@shared/ui/theme-switcher';

const optionFor = (label: string) => screen.getByRole('button', { name: label });
const pressed = () =>
  screen
    .getAllByRole('button')
    .filter((button) => button.getAttribute('aria-pressed') === 'true')
    .map((button) => button.getAttribute('aria-label'));

describe('ThemeSwitcher', () => {
  it('offers every theme as its own option', () => {
    render(<ThemeSwitcher />);

    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(optionFor('System theme')).toBeInTheDocument();
    expect(optionFor('Light theme')).toBeInTheDocument();
    expect(optionFor('Dark theme')).toBeInTheDocument();
  });

  it('marks exactly one option as active', () => {
    render(<ThemeSwitcher value="dark" />);

    expect(pressed()).toEqual(['Dark theme']);
  });

  it('reports the picked theme to the caller', async () => {
    const onChange = vi.fn();
    render(<ThemeSwitcher value="system" onChange={onChange} />);

    await userEvent.click(optionFor('Light theme'));

    expect(onChange).toHaveBeenCalledWith('light');
  });

  it('stays on the value the caller controls', async () => {
    const onChange = vi.fn();
    render(<ThemeSwitcher value="system" onChange={onChange} />);

    await userEvent.click(optionFor('Dark theme'));

    // Controlled: the caller decides, so nothing moves until value changes.
    expect(pressed()).toEqual(['System theme']);
  });

  it('tracks its own selection when left uncontrolled', async () => {
    render(<ThemeSwitcher defaultValue="system" />);
    expect(pressed()).toEqual(['System theme']);

    await userEvent.click(optionFor('Dark theme'));

    expect(pressed()).toEqual(['Dark theme']);
  });
});
