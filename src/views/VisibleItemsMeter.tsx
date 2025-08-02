import React, { useMemo } from 'react';

import { getFilterBySubstring, getFilterByTerritory, getScopeFilter } from '../controls/filter';
import { usePageParams } from '../controls/PageParamsContext';
import PaginationControls from '../controls/selectors/PaginationControls';
import Deemphasized from '../generic/Deemphasized';
import Hoverable from '../generic/Hoverable';
import { ObjectData } from '../types/DataTypes';

interface Props {
  objects: ObjectData[];
}

const VisibleItemsMeter: React.FC<Props> = ({ objects }) => {
  const { page, limit, territoryFilter } = usePageParams();
  const filterBySubstring = getFilterBySubstring();
  const filterByTerritory = getFilterByTerritory();
  const filterByScope = getScopeFilter();

  // Compute filter breakdown
  const nInScope = useMemo(() => objects.filter(filterByScope).length, [objects, filterByScope]);
  const nInTerritory = useMemo(
    () => objects.filter(filterByScope).filter(filterByTerritory).length,
    [objects, filterByScope, filterByTerritory],
  );
  const nMatchingSubstring = useMemo(
    () => objects.filter(filterByScope).filter(filterByTerritory).filter(filterBySubstring).length,
    [objects, filterByScope, filterByTerritory, filterBySubstring],
  );

  // Compute other counts
  const nOverall = objects.length;
  const nFilteredByScope = nOverall - nInScope;
  const nFilteredByTerritory = nInScope - nInTerritory;
  const nFilteredBySubstring = nInTerritory - nMatchingSubstring;
  const nFiltered = nMatchingSubstring;
  const nPages = limit < 1 ? 1 : Math.ceil(nFiltered / limit);
  if (nOverall === 0) {
    return 'Data is still loading. If you are waiting awhile there could be an error in the data.';
  }

  // nShown
  let nShown = limit;
  if (page > nPages || limit < 1) nShown = 0;
  if (page === nPages /* last page */) nShown = nFiltered - (nPages - 1) * limit;

  return (
    <div className="VisibleItemsMeter">
      <div>
        Showing <strong>{nShown.toLocaleString()}</strong>
        {nFiltered > nShown && <> of {<strong>{nFiltered.toLocaleString()}</strong>}</>} results.
      </div>
      {nOverall > nFiltered && (
        <Hoverable
          hoverContent={
            <>
              {nFilteredByScope > 0 && <div>Out of scope: {nFilteredByScope.toLocaleString()}</div>}
              {nFilteredByTerritory > 0 && (
                <div>
                  Not in territory ({territoryFilter}): {nFilteredByTerritory.toLocaleString()}
                </div>
              )}
              {nFilteredBySubstring > 0 && (
                <div>Not matching substring: {nFilteredBySubstring.toLocaleString()}</div>
              )}
            </>
          }
        >
          <Deemphasized>{(nOverall - nFiltered).toLocaleString()} filtered out.</Deemphasized>
        </Hoverable>
      )}
      {nPages > 1 && (
        <div>
          On <PaginationControls currentPage={page} totalPages={nPages} />
          of {nPages.toLocaleString()}.
        </div>
      )}
    </div>
  );
};

export default VisibleItemsMeter;
