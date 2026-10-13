import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

let aboutPageRenders = 0;
let setSearchParams: ReturnType<typeof useSearchParams>[1];
let currentSearch = '';

vi.mock('@pages/docs/AboutPage', () => ({
  default: () => {
    aboutPageRenders++;
    return <div>About page</div>;
  },
}));
vi.mock('@widgets/PageNavBar', () => ({
  default: () => {
    const [searchParams, setParams] = useSearchParams();
    setSearchParams = setParams;
    currentSearch = searchParams.toString();
    return null;
  },
}));
vi.mock('@widgets/PageFooter', () => ({ default: () => <footer>Footer</footer> }));
vi.mock('@features/consent/ConsentBanner', () => ({ default: () => null }));
vi.mock('../AmplitudeTracker', () => ({ default: () => null }));
vi.mock('@features/data/context/DataProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('App', () => {
  beforeEach(() => {
    aboutPageRenders = 0;
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })),
    );
  });

  it('does not re-render the routed page when only the search params change', async () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>,
    );
    await screen.findByText('About page');
    await act(async () => {}); // let the deferred DataProvider load
    const rendersBefore = aboutPageRenders;

    act(() => setSearchParams({ searchString: 'Chinese' }));

    expect(currentSearch).toBe('searchString=Chinese');
    expect(aboutPageRenders).toBe(rendersBefore);
  });

  it('shows the footer outside the data page', async () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Footer')).toBeTruthy();
  });
});
