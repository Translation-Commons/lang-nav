import { SkipBackIcon, SkipForwardIcon, StepBackIcon, StepForwardIcon } from 'lucide-react';
import React from 'react';

import { usePageParams } from '../PageParamsContext';

type Props = {
  currentPage: number;
  totalPages: number;
};

const PaginationControls: React.FC<Props> = ({ currentPage, totalPages }) => {
  const { updatePageParams } = usePageParams();
  if (totalPages <= 1) {
    return <></>;
  }

  return (
    <>
      Page:
      <div
        className="selector compact rounded"
        style={{
          marginBottom: 0,
          marginLeft: '0.5em',
          marginRight: '0.5em',
          display: 'inline-flex',
          verticalAlign: 'middle',
          alignItems: 'normal',
        }}
      >
        <button onClick={() => updatePageParams({ page: 1 })} disabled={currentPage === 1}>
          <SkipBackIcon size="1em" display="block" />
        </button>
        <button
          onClick={() => updatePageParams({ page: Math.max(1, currentPage - 1) })}
          disabled={currentPage === 1}
        >
          <StepBackIcon size="1em" display="block" />
        </button>

        <input
          className={currentPage === 1 ? 'empty' : ''}
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(event) => updatePageParams({ page: parseInt(event.target.value) })}
          style={{ width: 50, textAlign: 'center' }}
        />

        <button
          onClick={() => updatePageParams({ page: Math.min(totalPages, currentPage + 1) })}
          disabled={currentPage >= totalPages}
        >
          <StepForwardIcon size="1em" display="block" />
        </button>
        <button
          onClick={() => updatePageParams({ page: totalPages })}
          disabled={currentPage === totalPages}
        >
          <SkipForwardIcon size="1em" display="block" />
        </button>
      </div>
    </>
  );
};

export default PaginationControls;
