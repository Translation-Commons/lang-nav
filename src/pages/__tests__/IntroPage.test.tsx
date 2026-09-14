import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import IntroPage from '../IntroPage';

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn(() => createMockUsePageParams()),
}));
vi.mock('@features/transforms/search/useTrackSearch', () => ({ default: () => vi.fn() }));
vi.mock('@features/transforms/search/useIntroSearchSuggestions', () => ({
  default: () => async () => [],
}));
vi.mock('@widgets/intro/IntroLanguageLandscape', () => ({
  default: () => <div data-testid="language-landscape" />,
}));

describe('IntroPage', () => {
  it('points the "not sure where to start" link at the help section', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <IntroPage />
        </MemoryRouter>,
      );
    });

    const link = screen.getByRole('link', { name: /Not sure where to start/ });
    const target = link.getAttribute('href')?.replace('#', '');
    expect(target).toBeTruthy();
    expect(document.getElementById(target!)).toHaveTextContent('How can Language Navigator help?');
  });

  it('renders the Language Landscape module between the highlights and the task cards', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <IntroPage />
        </MemoryRouter>,
      );
    });

    expect(screen.getByTestId('language-landscape')).toBeInTheDocument();
  });
});
