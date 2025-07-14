import React from 'react';

import { usePageParams } from '../controls/PageParamsContext';
import PaginationControls from '../controls/selectors/PaginationControls';
import Deemphasized from '../generic/Deemphasized';
import Hoverable from '../generic/Hoverable';

interface Props {
  filterReason: React.ReactNode;
  nFiltered: number;
  nOverall: number;
}

const VisibleItemsMeter: React.FC<Props> = ({ filterReason, nFiltered, nOverall }) => {
  const { page, limit } = usePageParams();
  const nPages = limit < 1 ? 1 : Math.ceil(nFiltered / limit);
  const nShown = Math.min(limit, Math.max(nFiltered - (page - 1) * limit, 0));

  if (nOverall === 0) {
    return 'Data is still loading. If you are waiting awhile there could be an error in the data.';
  }

  return (
    <div className="VisibleItemsMeter">
      <div>
        Showing <strong>{nShown.toLocaleString()}</strong>
        {nFiltered > nShown && <> of {<strong>{nFiltered.toLocaleString()}</strong>}</>} results.
      </div>
      {nOverall > nFiltered && (
        <Hoverable hoverContent={filterReason} style={{ textDecoration: 'none' }}>
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
