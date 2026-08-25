import { TriangleAlertIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { useFilterByVitality, useScopeFilter } from '@features/transforms/filtering/filter';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import { getFilterByConnections } from '@features/transforms/filtering/filterByConnections';
import useFilters from '@features/transforms/filtering/useFilters';
import getFilterBySubstring from '@features/transforms/search/getFilterBySubstring';

import { EntityData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

import LimitInput from './LimitInput';
import PaginationControls from './PaginationControls';

interface Props {
  ents: EntityData[];
  shouldFilterUsingSearchBar?: boolean;
}

const VisibleItemsMeter: React.FC<Props> = ({ ents, shouldFilterUsingSearchBar = true }) => {
  const { page: pageParam, limit } = usePageParams();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByConnections = getFilterByConnections();
  const filterByScope = useScopeFilter();
  const filterByVitality = useFilterByVitality();
  const filterByPopulation = useFilters().Population;

  // Compute the number of filtered items
  const nOverall = ents.length;
  const nFiltered = useMemo(() => {
    return ents
      .filter(filterByScope)
      .filter(filterByConnections)
      .filter(filterByVitality)
      .filter(filterByPopulation)
      .filter(filterBySubstring).length;
  }, [
    ents,
    filterByScope,
    filterByConnections,
    filterByVitality,
    filterByPopulation,
    filterBySubstring,
  ]);

  // Compute other counts
  const nPages = limit < 1 ? 1 : Math.ceil(nFiltered / limit);
  const currentPage = pageParam > nPages || pageParam < 1 ? 1 : pageParam; // Reset to page 1 if the current page is out of bounds
  if (nOverall === 0) {
    return 'Data is still loading. If you are waiting awhile there could be an error in the data.';
  }

  // nShown
  let nShown = limit;
  if (limit < 1) nShown = nFiltered;
  if (currentPage === nPages /* last page */) nShown = nFiltered - (nPages - 1) * limit;

  return (
    <div>
      <HighLimitWarning nShown={nShown} />
      <div className="flex flex-row flex-wrap gap-2 items-center justify-center">
        <div className="flex flex-nowrap gap-2 text-sm items-center">
          Showing up to <LimitInput showTitle={false} />
          {nFiltered > nShown && <> of {nFiltered.toLocaleString()}</>} results.
        </div>
        {nOverall > nFiltered && (
          <Hoverable
            className="text-sm"
            hoverContent={
              <FilterBreakdown
                ents={ents}
                shouldFilterUsingSearchBar={shouldFilterUsingSearchBar}
              />
            }
          >
            <Deemphasized>{(nOverall - nFiltered).toLocaleString()} filtered out.</Deemphasized>
          </Hoverable>
        )}
        {nPages > 1 && <PaginationControls itemCount={nFiltered} />}
      </div>
    </div>
  );
};

const HighLimitWarning: React.FC<{ nShown: number }> = ({ nShown }) => {
  const { view, updatePageParams } = usePageParams();
  const threshold = getLimitThreshold(view);

  if (nShown <= threshold) return null;

  return (
    <div>
      <TriangleAlertIcon size="1em" style={{ color: 'var(--color-yellow)' }} />
      There are <strong>{nShown?.toLocaleString()}</strong> items visible, this may impact page
      performance. Consider reducing the limit to{' '}
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
