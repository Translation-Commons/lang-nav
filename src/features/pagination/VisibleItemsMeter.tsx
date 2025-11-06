import React, { useMemo } from 'react';

import FilterBreakdown from '@features/filtering/FilterBreakdown';
import Hoverable from '@features/hovercard/Hoverable';
import usePageParams from '@features/page-params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

import {
  getFilterBySubstring,
  getFilterByTerritory,
  getFilterByVitality,
  getScopeFilter,
} from '../filtering/filter';

import LimitSelector from './LimitSelector';
import PaginationControls from './PaginationControls';

interface Props {
  objects: ObjectData[];
  shouldFilterUsingSearchBar?: boolean;
}

const VisibleItemsMeter: React.FC<Props> = ({ objects, shouldFilterUsingSearchBar = true }) => {
  const { page, limit } = usePageParams();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByTerritory = getFilterByTerritory();
  const filterByScope = getScopeFilter();
  const filterByVitality = getFilterByVitality();

  // Compute the number of filtered items
  const nOverall = objects.length;
  const nFiltered = useMemo(() => {
    return objects
      .filter(filterByScope)
      .filter(filterByTerritory)
      .filter(filterByVitality)
      .filter(filterBySubstring).length;
  }, [objects, filterByScope, filterByTerritory, filterByVitality, filterBySubstring]);

  // Compute other counts
  const nPages = limit < 1 ? 1 : Math.ceil(nFiltered / limit);
  if (nOverall === 0) {
    return 'Data is still loading. If you are waiting awhile there could be an error in the data.';
  }

  // nShown
  let nShown = limit;
  if (page > nPages || limit < 1) nShown = 0;
  if (page === nPages /* last page */) nShown = nFiltered - (nPages - 1) * limit;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '0.25em',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <div>
        Showing{' '}
        <Hoverable
          hoverContent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
              <div>Set the maximum number of results that can appear.</div>
              <LimitSelector />
            </div>
          }
        >
          {nShown.toLocaleString()}
        </Hoverable>
        {nFiltered > nShown && <> of {<strong>{nFiltered.toLocaleString()}</strong>}</>} results.
      </div>
      {nOverall > nFiltered && (
        <Hoverable
          hoverContent={
            <FilterBreakdown
              objects={objects}
              shouldFilterUsingSearchBar={shouldFilterUsingSearchBar}
            />
          }
        >
          <Deemphasized>{(nOverall - nFiltered).toLocaleString()} filtered out.</Deemphasized>
        </Hoverable>
      )}
      {nPages > 1 && (
        <div>
          On <PaginationControls itemCount={nFiltered} />
          of {nPages.toLocaleString()}.
        </div>
      )}
    </div>
  );
};

export default VisibleItemsMeter;
