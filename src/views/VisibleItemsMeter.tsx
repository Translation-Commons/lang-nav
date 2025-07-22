import React, { useMemo } from 'react';

import { getScopeFilter, getSubstringFilter } from '../controls/filter';
import { usePageParams } from '../controls/PageParamsContext';
import PaginationControls from '../controls/selectors/PaginationControls';
import Deemphasized from '../generic/Deemphasized';
import Hoverable from '../generic/Hoverable';
import { ObjectData } from '../types/DataTypes';

interface Props {
  objects: ObjectData[];
}

const VisibleItemsMeter: React.FC<Props> = ({ objects }) => {
  const { page, limit } = usePageParams();
  const substringFilter = getSubstringFilter() ?? (() => true);
  const scopeFilter = getScopeFilter();

  // Compute amounts
  const nOverall = objects.length;
  if (nOverall === 0) {
    return 'Data is still loading. If you are waiting awhile there could be an error in the data.';
  }

  // nFiltered
  const nInScope = useMemo(() => objects.filter(scopeFilter).length, [objects, scopeFilter]);
  const nMatchingSubstring = useMemo(
    () => objects.filter(scopeFilter).filter(substringFilter).length,
    [objects, scopeFilter, substringFilter],
  );
  const nFilteredByScope = nOverall - nInScope;
  const nFilteredBySubstring = nInScope - nMatchingSubstring;
  const nFiltered = nMatchingSubstring;
  const nPages = limit < 1 ? 1 : Math.ceil(nFiltered / limit);

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
              {nFilteredBySubstring > 0 && (
                <div>Not matching substring: {nFilteredBySubstring.toLocaleString()}</div>
              )}
            </>
          }
          style={{ textDecoration: 'none' }}
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
