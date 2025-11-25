import {
  SkipBackIcon,
  SkipForwardIcon,
  StepBackIcon,
  StepForwardIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/hovercard/HoverableButton';
import usePageParams from '@features/params/usePageParams';

type Props = {
  itemCount: number;
};

const PaginationControls: React.FC<Props> = ({ itemCount }) => {
  const { page: currentPage, limit, updatePageParams } = usePageParams();
  const totalPages = limit < 1 ? 1 : Math.ceil(itemCount / limit);
  if (totalPages <= 1) {
    return <></>;
  }

  const compactStyle: React.CSSProperties = {
    lineHeight: '1.5',
    padding: '0em 0.25em',
    fontSize: '1em',
    fontWeight: 'normal',
    margin: '0 -0.125em',
    borderRadius: '0',
  };

  return (
    <>
      Page:
      <div
        className="selector"
        style={{
          marginBottom: 0,
          marginLeft: '0.5em',
          marginRight: '0.5em',
          display: 'inline-flex',
          verticalAlign: 'middle',
          alignItems: 'normal',
        }}
      >
        <button
          onClick={() => updatePageParams({ page: 1 })}
          disabled={currentPage === 1}
          style={{ ...compactStyle, borderRadius: '1em 0 0 1em' }}
        >
          <SkipBackIcon size="1em" style={{ display: 'block' }} />
        </button>
        <button
          onClick={() => updatePageParams({ page: Math.max(1, currentPage - 1) })}
          disabled={currentPage === 1}
          style={compactStyle}
        >
          <StepBackIcon size="1em" style={{ display: 'block' }} />
        </button>

        <input
          className={currentPage === 1 ? 'empty' : ''}
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(event) => updatePageParams({ page: parseInt(event.target.value) })}
          style={{ ...compactStyle, width: 50, textAlign: 'center' }}
        />

        {currentPage > totalPages && (
          <HoverableButton
            onClick={() => updatePageParams({ page: totalPages })}
            hoverContent="This page number is out of range. Showing the first page instead. Click to go to the actually last page."
            style={{ margin: 'none', padding: 0, borderRadius: 0 }}
          >
            <TriangleAlertIcon size="1em" style={{ display: 'block' }} />
          </HoverableButton>
        )}

        <button
          onClick={() => updatePageParams({ page: Math.min(totalPages, currentPage + 1) })}
          disabled={currentPage >= totalPages}
          style={compactStyle}
        >
          <StepForwardIcon size="1em" style={{ display: 'block' }} />
        </button>
        <button
          onClick={() => updatePageParams({ page: totalPages })}
          disabled={currentPage === totalPages}
          style={{ ...compactStyle, borderRadius: '0 1em 1em 0' }}
        >
          <SkipForwardIcon size="1em" style={{ display: 'block' }} />
        </button>
      </div>
    </>
  );
};

export default PaginationControls;
