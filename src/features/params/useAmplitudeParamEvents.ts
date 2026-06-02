import { useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import {
  trackDetailSwitched,
  trackDetailViewed,
  trackEntitySwitched,
  trackFilterChanged,
  trackSearchTyped,
  trackSortChanged,
  trackViewSwitched,
} from '@shared/lib/amplitude';
import {
  areFilterValuesEqual,
  deriveFilterAction,
  FILTER_PARAM_KEYS,
  resolveEnumValue,
} from '@shared/lib/amplitudeFormat';

import { getParamsFromURL } from './getParamsFromURL';
import { PageParamsOptional } from './PageParamTypes';

/**
 * Emits granular `explore_*` events when URL params change. Mounted once
 * alongside the page-view tracker.
 *
 * Strategy: hold a ref to the previous param snapshot and diff it against the
 * current one on every render. This catches every code path that calls
 * `updatePageParams` (selectors, search bar, card/row clicks, programmatic
 * nav) from a single place, so we don't have to instrument each call site.
 *
 * Two intentional gaps:
 *   - First render: seed the ref and skip emitting, otherwise a deep link
 *     with non-default params would fire spurious `explore_*` events.
 *   - Pathname change: same treatment — `page_viewed` covers the entry, and
 *     reusing the previous page's snapshot would mis-attribute diffs across
 *     routes.
 */
export default function useAmplitudeParamEvents() {
  const location = useLocation();
  const [urlParams] = useSearchParams();

  const prevParamsRef = useRef<PageParamsOptional | null>(null);
  const prevPathnameRef = useRef<string>(location.pathname);

  useEffect(() => {
    const current = getParamsFromURL(urlParams);
    const previous = prevParamsRef.current;
    const pathnameChanged = prevPathnameRef.current !== location.pathname;

    if (previous == null || pathnameChanged) {
      prevParamsRef.current = current;
      prevPathnameRef.current = location.pathname;
      return;
    }

    const base = {
      path: location.pathname,
      view: current.view ?? previous.view,
      entity: current.objectType ?? previous.objectType,
    };

    if (current.objectType !== previous.objectType) {
      trackEntitySwitched({
        ...base,
        from_entity: previous.objectType,
        to_entity: current.objectType,
      });
    }

    if (current.view !== previous.view) {
      trackViewSwitched({
        ...base,
        from_view: previous.view,
        to_view: current.view,
      });
    }

    const sortChangedKeys: string[] = [];
    if (current.sortBy !== previous.sortBy) sortChangedKeys.push('sortBy');
    if (current.secondarySortBy !== previous.secondarySortBy)
      sortChangedKeys.push('secondarySortBy');
    if (current.sortBehavior !== previous.sortBehavior) sortChangedKeys.push('sortBehavior');
    if (sortChangedKeys.length > 0) {
      trackSortChanged({
        ...base,
        sort_by: current.sortBy,
        secondary_sort_by: current.secondarySortBy,
        sort_behavior: resolveEnumValue('sortBehavior', current.sortBehavior) as string | undefined,
        changed_keys: sortChangedKeys,
      });
    }

    if (current.searchString !== previous.searchString) {
      const next = current.searchString ?? '';
      trackSearchTyped({
        ...base,
        search_string: next,
        search_by: current.searchBy,
        cleared: next === '',
      });
    }

    for (const key of FILTER_PARAM_KEYS) {
      const prevVal = previous[key as keyof PageParamsOptional];
      const nextVal = current[key as keyof PageParamsOptional];
      if (areFilterValuesEqual(prevVal, nextVal)) continue;
      trackFilterChanged({
        ...base,
        filter_key: key,
        filter_value: resolveEnumValue(key, nextVal),
        previous_value: resolveEnumValue(key, prevVal),
        filter_action: deriveFilterAction(prevVal, nextVal),
      });
    }

    const prevID = previous.objectID;
    const nextID = current.objectID;
    if (prevID == null && nextID != null) {
      trackDetailViewed({
        ...base,
        object_id: nextID,
        object_entity: current.objectType,
      });
    } else if (prevID != null && nextID != null && prevID !== nextID) {
      trackDetailSwitched({
        ...base,
        from_object_id: prevID,
        to_object_id: nextID,
        from_object_entity: previous.objectType,
        to_object_entity: current.objectType,
      });
    }

    prevParamsRef.current = current;
    prevPathnameRef.current = location.pathname;
  }, [urlParams, location.pathname]);
}
