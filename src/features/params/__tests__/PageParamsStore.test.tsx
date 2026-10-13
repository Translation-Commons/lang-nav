import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { PageParamsContextState } from '@features/params/PageParamsContext';
import PageParamsProvider from '@features/params/PageParamsProvider';
import { PageParamsStoreProvider } from '@features/params/PageParamsStore';
import { getDefaultParams } from '@features/params/Profiles';
import usePageParams from '@features/params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';

import { reactNodeToString } from '@shared/lib/stringExportUtils';

let updateGlobal: PageParamsContextState['updatePageParams'];
let updateLocal: PageParamsContextState['updatePageParams'];

const GlobalUpdater = () => {
  updateGlobal = usePageParams().updatePageParams;
  return null;
};

const LocalUpdater = () => {
  updateLocal = usePageParams('updatePageParams').updatePageParams;
  return null;
};

const LocationSearch = () => <div data-testid="url">{useLocation().search}</div>;

function renderWithParams(children: React.ReactNode, initialURL = '/data') {
  return render(
    <MemoryRouter initialEntries={[initialURL]}>
      <PageParamsProvider>
        <GlobalUpdater />
        <LocationSearch />
        {children}
      </PageParamsProvider>
    </MemoryRouter>,
  );
}

describe('page params store', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })),
    );
  });

  it('does not re-render a key-selecting consumer when an unrelated param changes', () => {
    let renders = 0;
    const SearchStringReader = () => {
      renders++;
      return <div>{usePageParams('searchString').searchString}</div>;
    };
    renderWithParams(<SearchStringReader />);
    const rendersBefore = renders;

    act(() => updateGlobal({ page: 3 }));

    expect(screen.getByTestId('url').textContent).toContain('page=3');
    expect(renders).toBe(rendersBefore);
  });

  it('updates a key-selecting consumer when its param changes in the URL', () => {
    const SearchStringReader = () => (
      <div data-testid="search">{usePageParams('searchString').searchString}</div>
    );
    renderWithParams(<SearchStringReader />);

    act(() => updateGlobal({ searchString: 'Chinese' }));

    expect(screen.getByTestId('search').textContent).toBe('Chinese');
  });

  it('renders a param change in the background, after an urgent pass with the previous value', () => {
    const seen: string[] = [];
    const SearchStringReader = () => {
      const { searchString } = usePageParams('searchString');
      seen.push(searchString);
      return null;
    };
    renderWithParams(<SearchStringReader />);
    seen.length = 0;

    act(() => updateGlobal({ searchString: 'Chinese' }));

    expect(seen[0]).toBe('');
    expect(seen[seen.length - 1]).toBe('Chinese');
  });

  it('keeps local param updates out of the URL and the global params', () => {
    const LimitReader = ({ testID }: { testID: string }) => (
      <div data-testid={testID}>{usePageParams('limit').limit}</div>
    );
    renderWithParams(
      <>
        <LimitReader testID="global-limit" />
        <LocalParamsProvider>
          <LocalUpdater />
          <LimitReader testID="local-limit" />
        </LocalParamsProvider>
      </>,
    );
    const globalLimit = screen.getByTestId('global-limit').textContent;

    act(() => updateLocal({ limit: 7 }));

    expect(screen.getByTestId('local-limit').textContent).toBe('7');
    expect(screen.getByTestId('global-limit').textContent).toBe(globalLimit);
    expect(screen.getByTestId('url').textContent).not.toContain('limit=7');
  });

  it('passes global param changes through to local consumers', () => {
    const SourceReader = () => (
      <div data-testid="local-source">{usePageParams('languageSource').languageSource}</div>
    );
    renderWithParams(
      <LocalParamsProvider>
        <SourceReader />
      </LocalParamsProvider>,
    );

    act(() => updateGlobal({ languageSource: LanguageSource.Glottolog }));

    expect(screen.getByTestId('local-source').textContent).toBe(LanguageSource.Glottolog);
  });

  it('syncs a local entID change to the global params', () => {
    renderWithParams(
      <LocalParamsProvider>
        <LocalUpdater />
      </LocalParamsProvider>,
    );

    act(() => updateLocal({ entID: 'zho' }));

    expect(screen.getByTestId('url').textContent).toContain('entID=zho');
  });

  it('provides a static value to content rendered outside the app tree', () => {
    const SearchStringReader = () => <>{usePageParams('searchString').searchString}</>;
    const value: PageParamsContextState = {
      ...getDefaultParams(),
      searchString: 'export me',
      updatePageParams: () => {},
      brightness: { preference: 'light', pageBrightness: 'light', setPreference: () => {} },
      paramsLevel: 'global',
    };

    const text = reactNodeToString(
      <PageParamsStoreProvider value={value}>
        <SearchStringReader />
      </PageParamsStoreProvider>,
    );

    expect(text).toBe('export me');
  });
});
