import { act, render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  trackDetailSwitched,
  trackDetailViewed,
  trackEntitySwitched,
  trackFilterChanged,
  trackSearchTyped,
  trackSortChanged,
  trackViewSwitched,
} from '@shared/lib/amplitude';

import useAmplitudeParamEvents from '../useAmplitudeParamEvents';

vi.mock('@shared/lib/amplitude', () => ({
  trackEntitySwitched: vi.fn(),
  trackViewSwitched: vi.fn(),
  trackSortChanged: vi.fn(),
  trackSearchTyped: vi.fn(),
  trackFilterChanged: vi.fn(),
  trackDetailViewed: vi.fn(),
  trackDetailSwitched: vi.fn(),
}));

const trackers = {
  entity: trackEntitySwitched as ReturnType<typeof vi.fn>,
  view: trackViewSwitched as ReturnType<typeof vi.fn>,
  sort: trackSortChanged as ReturnType<typeof vi.fn>,
  search: trackSearchTyped as ReturnType<typeof vi.fn>,
  filter: trackFilterChanged as ReturnType<typeof vi.fn>,
  detailViewed: trackDetailViewed as ReturnType<typeof vi.fn>,
  detailSwitched: trackDetailSwitched as ReturnType<typeof vi.fn>,
};

let navigateRef: ((to: string) => void) | null = null;

const Harness: React.FC<{ initialURL: string }> = ({ initialURL }) => (
  <MemoryRouter initialEntries={[initialURL]}>
    <HookHost />
  </MemoryRouter>
);

const HookHost: React.FC = () => {
  const navigate = useNavigate();
  navigateRef = navigate;
  useAmplitudeParamEvents();
  return null;
};

function go(url: string) {
  if (!navigateRef) throw new Error('navigate ref not set');
  act(() => navigateRef!(url));
}

describe('useAmplitudeParamEvents', () => {
  beforeEach(() => {
    Object.values(trackers).forEach((m) => m.mockClear());
    navigateRef = null;
  });

  it('skips emitting on initial mount even with non-default params', () => {
    render(<Harness initialURL="/data?searchString=Spanish&territoryFilter=ES&view=Table" />);
    expect(trackers.search).not.toHaveBeenCalled();
    expect(trackers.filter).not.toHaveBeenCalled();
    expect(trackers.view).not.toHaveBeenCalled();
  });

  it('emits explore_search_typed when searchString changes', () => {
    render(<Harness initialURL="/data" />);
    go('/data?searchString=Spanish');
    expect(trackers.search).toHaveBeenCalledTimes(1);
    expect(trackers.search.mock.calls[0][0]).toMatchObject({
      search_string: 'Spanish',
      cleared: false,
      path: '/data',
    });
  });

  it('marks search as cleared when value becomes empty', () => {
    render(<Harness initialURL="/data?searchString=Spanish" />);
    go('/data?searchString=');
    expect(trackers.search).toHaveBeenCalledTimes(1);
    expect(trackers.search.mock.calls[0][0]).toMatchObject({
      search_string: '',
      cleared: true,
    });
  });

  it('emits one explore_filter_changed event per changed filter key', () => {
    render(<Harness initialURL="/data" />);
    go('/data?territoryFilter=ES&writingSystemFilter=Latn');
    expect(trackers.filter).toHaveBeenCalledTimes(2);
    const keys = trackers.filter.mock.calls.map((c) => c[0].filter_key).sort();
    expect(keys).toEqual(['territoryFilter', 'writingSystemFilter']);
  });

  it('derives "set" / "cleared" for string filter transitions', () => {
    render(<Harness initialURL="/data" />);
    go('/data?territoryFilter=ES');
    expect(trackers.filter.mock.calls[0][0]).toMatchObject({
      filter_key: 'territoryFilter',
      filter_value: 'ES',
      filter_action: 'set',
    });
    trackers.filter.mockClear();
    go('/data?territoryFilter=');
    expect(trackers.filter.mock.calls[0][0]).toMatchObject({
      filter_key: 'territoryFilter',
      filter_action: 'cleared',
    });
  });

  it('does not emit when only an untracked param (limit) changes', () => {
    render(<Harness initialURL="/data" />);
    go('/data?limit=50');
    expect(trackers.search).not.toHaveBeenCalled();
    expect(trackers.filter).not.toHaveBeenCalled();
    expect(trackers.view).not.toHaveBeenCalled();
    expect(trackers.sort).not.toHaveBeenCalled();
    expect(trackers.entity).not.toHaveBeenCalled();
    expect(trackers.detailViewed).not.toHaveBeenCalled();
    expect(trackers.detailSwitched).not.toHaveBeenCalled();
  });

  it('emits explore_view_switched when view changes', () => {
    render(<Harness initialURL="/data" />);
    go('/data?view=Table');
    expect(trackers.view).toHaveBeenCalledTimes(1);
    expect(trackers.view.mock.calls[0][0]).toMatchObject({ to_view: 'Table' });
  });

  it('emits explore_entity_switched when objectType changes', () => {
    render(<Harness initialURL="/data?objectType=Language" />);
    go('/data?objectType=Locale');
    expect(trackers.entity).toHaveBeenCalledTimes(1);
    expect(trackers.entity.mock.calls[0][0]).toMatchObject({
      from_entity: 'Language',
      to_entity: 'Locale',
    });
  });

  it('emits explore_sort_changed with the keys that changed', () => {
    render(<Harness initialURL="/data" />);
    go('/data?sortBy=Name&sortBehavior=-1');
    expect(trackers.sort).toHaveBeenCalledTimes(1);
    const props = trackers.sort.mock.calls[0][0];
    expect(props.changed_keys.sort()).toEqual(['sortBehavior', 'sortBy']);
    expect(props.sort_behavior).toBe('desc');
  });

  it('emits explore_detail_viewed when objectID goes from undefined to defined', () => {
    render(<Harness initialURL="/data" />);
    go('/data?objectID=zho');
    expect(trackers.detailViewed).toHaveBeenCalledTimes(1);
    expect(trackers.detailViewed.mock.calls[0][0]).toMatchObject({ object_id: 'zho' });
    expect(trackers.detailSwitched).not.toHaveBeenCalled();
  });

  it('emits explore_detail_switched when objectID changes from one defined to another', () => {
    render(<Harness initialURL="/data?objectID=zho" />);
    go('/data?objectID=spa');
    expect(trackers.detailSwitched).toHaveBeenCalledTimes(1);
    expect(trackers.detailSwitched.mock.calls[0][0]).toMatchObject({
      from_object_id: 'zho',
      to_object_id: 'spa',
    });
    expect(trackers.detailViewed).not.toHaveBeenCalled();
  });

  it('does not emit any detail event when objectID is cleared', () => {
    render(<Harness initialURL="/data?objectID=zho" />);
    go('/data');
    expect(trackers.detailViewed).not.toHaveBeenCalled();
    expect(trackers.detailSwitched).not.toHaveBeenCalled();
  });

  it('emits multiple events when several concepts change in one navigation', () => {
    render(<Harness initialURL="/data" />);
    go('/data?view=Map&objectID=zho&territoryFilter=ES');
    expect(trackers.view).toHaveBeenCalledTimes(1);
    expect(trackers.filter).toHaveBeenCalledTimes(1);
    expect(trackers.detailViewed).toHaveBeenCalledTimes(1);
  });

  it('does not emit on the first param diff after a pathname change', () => {
    render(<Harness initialURL="/data?searchString=foo" />);
    // Pathname change to /about with a different searchString:
    // we expect no `search_typed` event for the inherited state on the new page.
    go('/about?searchString=bar');
    expect(trackers.search).not.toHaveBeenCalled();
  });

  it('detects single additions to array filters as "added"', () => {
    render(<Harness initialURL="/data?languageScopes=1" />);
    go('/data?languageScopes=1,2');
    expect(trackers.filter).toHaveBeenCalledTimes(1);
    expect(trackers.filter.mock.calls[0][0]).toMatchObject({
      filter_key: 'languageScopes',
      filter_action: 'added',
    });
  });

  it('detects single removals from array filters as "removed"', () => {
    render(<Harness initialURL="/data?languageScopes=1,2" />);
    go('/data?languageScopes=1');
    expect(trackers.filter).toHaveBeenCalledTimes(1);
    expect(trackers.filter.mock.calls[0][0]).toMatchObject({
      filter_key: 'languageScopes',
      filter_action: 'removed',
    });
  });

  it('does not re-emit when the same searchString is set again', () => {
    render(<Harness initialURL="/data?searchString=Spanish" />);
    go('/data?searchString=Spanish&limit=50');
    expect(trackers.search).not.toHaveBeenCalled();
  });
});
