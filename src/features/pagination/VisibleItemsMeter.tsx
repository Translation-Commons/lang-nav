import { TriangleAlertIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import FiltersPopover from '@features/transforms/filtering/FiltersPopover';
import useAllFilters from '@features/transforms/filtering/useAllFilters';

import { EntityData } from '@entities/types/EntityTypes';

import LimitInput from './LimitInput';
import PaginationControls from './PaginationControls';

interface Props {
  ents: EntityData[];
}

const VisibleItemsMeter: React.FC<Props> = ({ ents }) => {
  const { page: pageParam, limit, paramsLevel } = usePageParams();
  const filterFunction = useAllFilters();

  // Compute the number of filtered items
  const nOverall = ents.length;
  const nFiltered = useMemo(() => {
    return ents.filter(filterFunction).length;
  }, [ents, filterFunction]);

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
        {/* Providing a local way to set filters if we are inside a context rather than the page view */}
        {paramsLevel === 'local' && <FiltersPopover />}
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
      <TriangleAlertIcon
        className="inline-block"
        size="1em"
        style={{ color: 'var(--color-yellow)' }}
      />
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
    case View.Chart:
      return 1000;
    case View.Table:
      return 200;
    case View.CardList:
      return 40;
    case View.Details:
      return 20;
    case View.Hierarchy:
    case View.Reports:
      return 10;
  }
}

export default VisibleItemsMeter;
