import { useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import {
  trackDetailSwitched,
  trackDetailViewed,
  trackEntitySwitched,
  trackFilterChanged,
  trackSortChanged,
  trackViewSwitched,
} from '@shared/lib/amplitude';
import {
  areFilterValuesEqual,
  buildSortKeys,
  deriveFilterAction,
  FILTER_PARAM_KEYS,
  resolveEnumValue,
} from '@shared/lib/amplitudeFormat';

import { getParamsFromURL } from './getParamsFromURL';
import { PageParams } from './PageParamTypes';
import { getDefaultParams } from './Profiles';

/**
 * Emits granular `explore_*` events by diffing the previous param snapshot
 * against the current one, catching every `updatePageParams` call from one
 * place. `explore_search_typed` is fired from the search component instead
 * (see `useTrackSearch`). First render and pathname changes reseed without
 * emitting, so deep links and cross-route diffs don't fire spurious events.
 */
export default function useAmplitudeParamEvents() {
  const location = useLocation();
  const [urlParams] = useSearchParams();

  const prevParamsRef = useRef<Partial<PageParams> | null>(null);
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

    // Defaults never appear in the URL; resolve per profile/entity so entity,
    // view, sort, and the previous_* values are always populated correctly.
    const currentDefaults = getDefaultParams(current.objectType, current.view, current.profile);
    const previousDefaults = getDefaultParams(previous.objectType, previous.view, previous.profile);

    const base = {
      path: location.pathname,
      view: current.view ?? currentDefaults.view,
      entity: current.objectType ?? currentDefaults.objectType,
    };

    if (current.objectType !== previous.objectType) {
      trackEntitySwitched({
        ...base,
        previous_entity: previous.objectType ?? previousDefaults.objectType,
      });
    }

    if (current.view !== previous.view) {
      trackViewSwitched({ ...base, previous_view: previous.view ?? previousDefaults.view });
    }

    const sortChanged =
      current.sortBy !== previous.sortBy ||
      current.secondarySortBy !== previous.secondarySortBy ||
      current.sortBehavior !== previous.sortBehavior;
    if (sortChanged) {
      trackSortChanged({
        ...base,
        sort: buildSortKeys(
          current.sortBy ?? currentDefaults.sortBy,
          current.secondarySortBy ?? currentDefaults.secondarySortBy,
          current.sortBehavior ?? currentDefaults.sortBehavior,
        ),
      });
    }

    for (const key of FILTER_PARAM_KEYS) {
      const prevVal = previous[key as keyof PageParams];
      const nextVal = current[key as keyof PageParams];
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
      trackDetailViewed({ ...base, object_id: nextID });
    } else if (prevID != null && nextID != null && prevID !== nextID) {
      trackDetailSwitched({ ...base, object: nextID, previous_object: prevID });
    }

    prevParamsRef.current = current;
    prevPathnameRef.current = location.pathname;
  }, [urlParams, location.pathname]);
}
