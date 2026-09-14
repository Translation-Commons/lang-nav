import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import IntroLanguageLandscape from '../IntroLanguageLandscape';

vi.mock('../IntroLandscapeByTerritory', () => ({
  default: () => <div data-testid="by-territory" />,
}));
vi.mock('../IntroLandscapeByScale', () => ({ default: () => <div data-testid="by-scale" /> }));

describe('IntroLanguageLandscape', () => {
  it('shows the By territory tab by default', () => {
    render(<IntroLanguageLandscape />);

    expect(screen.getByTestId('by-territory')).toBeInTheDocument();
  });

  it('switches to the By scale tab when clicked', async () => {
    render(<IntroLanguageLandscape />);

    await userEvent.click(screen.getByRole('tab', { name: 'By scale' }));

    expect(screen.getByTestId('by-scale')).toBeInTheDocument();
  });
});
