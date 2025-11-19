import { TriangleAlertIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import FilterBreakdown from '@features/filtering/FilterBreakdown';
import { getFilterByConnections } from '@features/filtering/filterByConnections';
import Hoverable from '@features/hovercard/Hoverable';
import HoverableButton from '@features/hovercard/HoverableButton';
import { View } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

import { getFilterBySubstring, getFilterByVitality, getScopeFilter } from '../filtering/filter';

import LimitSelector from './LimitSelector';
import PaginationControls from './PaginationControls';

interface Props {
  objects: ObjectData[];
  shouldFilterUsingSearchBar?: boolean;
}

const VisibleItemsMeter: React.FC<Props> = ({ objects, shouldFilterUsingSearchBar = true }) => {
  const { page, limit } = usePageParams();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByConnections = getFilterByConnections();
  const filterByScope = getScopeFilter();
  const filterByVitality = getFilterByVitality();

  // Compute the number of filtered items
  const nOverall = objects.length;
  const nFiltered = useMemo(() => {
    return objects
      .filter(filterByScope)
      .filter(filterByConnections)
      .filter(filterByVitality)
      .filter(filterBySubstring).length;
  }, [objects, filterByScope, filterByConnections, filterByVitality, filterBySubstring]);

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
    <div>
      <HighLimitWarning />
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
    </div>
  );
};

const HighLimitWarning: React.FC = () => {
  const { limit, view, updatePageParams } = usePageParams();
  const threshold = getLimitThreshold(view);

  if (limit <= threshold) return null;

  return (
    <div>
      <TriangleAlertIcon size="1em" style={{ color: 'var(--color-text-yellow)' }} />
      There are <strong>{limit}</strong> items visible, this may impact page performance. Consider
      reducing it to{' '}
      <HoverableButton
        onClick={() => updatePageParams({ limit: threshold })}
        style={{ padding: '0 0.25em' }}
      >
        {threshold}
      </HoverableButton>
      .
    </div>
  );
};

function getLimitThreshold(view: View): number {
  switch (view) {
    case View.Map:
      return 1000;
    case View.Details:
    case View.Table:
      return 200;
    case View.CardList:
      return 20;
    case View.Hierarchy:
    case View.Reports:
      return 10;
  }
}

export default VisibleItemsMeter;
