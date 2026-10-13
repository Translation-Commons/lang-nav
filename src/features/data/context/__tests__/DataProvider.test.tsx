import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DataProvider from '@features/data/context/DataProvider';
import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamsContextState } from '@features/params/PageParamsContext';
import PageParamsProvider from '@features/params/PageParamsProvider';
import usePageParams from '@features/params/usePageParams';

const coreData = {
  ents: {},
  languages: [],
  censuses: {},
  organizations: [],
  locales: [],
  territories: [],
  variants: [],
  writingSystems: [],
  orthographies: [],
  keyboards: [],
  technologies: [],
};

vi.mock('@features/data/load/CoreData', () => ({
  useCoreData: () => ({ coreData, loadCoreData: async () => {} }),
}));
vi.mock('@features/data/load/SupplementalData', () => ({
  loadSupplementalData: async () => {},
}));

let updatePageParams: PageParamsContextState['updatePageParams'];
const ParamsUpdater = () => {
  updatePageParams = usePageParams('updatePageParams').updatePageParams;
  return null;
};

describe('DataProvider', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })),
    );
  });

  it('does not re-render data consumers when a param it does not use changes', async () => {
    let renders = 0;
    const DataConsumer = () => {
      useDataContext();
      renders++;
      return null;
    };
    render(
      <MemoryRouter initialEntries={['/data']}>
        <PageParamsProvider>
          <ParamsUpdater />
          <DataProvider>
            <DataConsumer />
          </DataProvider>
        </PageParamsProvider>
      </MemoryRouter>,
    );
    await act(async () => {}); // let the loading stages settle
    const rendersBefore = renders;

    act(() => updatePageParams({ page: 3 }));

    expect(renders).toBe(rendersBefore);
  });
});
