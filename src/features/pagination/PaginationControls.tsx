import {
  SkipBackIcon,
  SkipForwardIcon,
  StepBackIcon,
  StepForwardIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import React, { useCallback, useEffect } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import usePageParams from '@features/params/usePageParams';

type Props = {
  itemCount: number;
};

const PaginationControls: React.FC<Props> = ({ itemCount }) => {
  const { page: paramPage, limit, updatePageParams } = usePageParams();
  const totalPages = limit < 1 ? 1 : Math.ceil(itemCount / limit);
  const [currentPage, setCurrentPage] = React.useState<number | undefined>(paramPage);

  useEffect(() => {
    setCurrentPage(paramPage);
  }, [paramPage]);

  const setPageToBeginning = useCallback(() => {
    setCurrentPage(1);
    updatePageParams({ page: 1 });
  }, [updatePageParams]);
  const incrementPage = useCallback(
    (step: number) => {
      const page = Math.min(Math.max((currentPage || 1) + step, 1), totalPages);
      setCurrentPage(page);
      updatePageParams({ page });
    },
    [updatePageParams, currentPage, totalPages],
  );
  const setPageToEnd = useCallback(() => {
    setCurrentPage(totalPages);
    updatePageParams({ page: totalPages });
  }, [updatePageParams, totalPages]);

  if (totalPages <= 1) return <></>;

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
          onClick={setPageToBeginning}
          disabled={currentPage === 1}
          style={{ ...compactStyle, borderRadius: '1em 0 0 1em' }}
        >
          <SkipBackIcon size="1em" style={{ display: 'block' }} />
        </button>
        <HoverableButton
          disabled={currentPage === 1}
          hoverContent={
            <>
              Go to Previous Page.
              <br />
              Shortcut: Left Arrow Key ←
            </>
          }
          onClick={() => incrementPage(-1)}
          style={compactStyle}
        >
          <StepBackIcon size="1em" style={{ display: 'block' }} />
        </HoverableButton>

        <input
          className={!currentPage || currentPage === 1 ? 'empty' : ''}
          value={currentPage || ''}
          onChange={(event) =>
            event.target.value
              ? setCurrentPage(parseInt(event.target.value))
              : setCurrentPage(undefined)
          }
          onBlur={(event) =>
            updatePageParams({
              page: Math.min(Math.max(parseInt(event.target.value), 1), totalPages),
            })
          }
          style={{ ...compactStyle, width: 50, textAlign: 'center' }}
        />

        {currentPage && currentPage > totalPages && (
          <HoverableButton
            onClick={setPageToEnd}
            hoverContent="This page number is out of range. Showing the first page instead. Click to go to the actually last page."
            style={{ margin: 'none', padding: 0, borderRadius: 0 }}
          >
            <TriangleAlertIcon size="1em" style={{ display: 'block' }} />
          </HoverableButton>
        )}

        <HoverableButton
          disabled={!currentPage || currentPage >= totalPages}
          hoverContent={
            <>
              Go to Next Page.
              <br />
              Shortcut: Right Arrow Key →
            </>
          }
          onClick={() => incrementPage(1)}
          style={compactStyle}
        >
          <StepForwardIcon size="1em" style={{ display: 'block' }} />
        </HoverableButton>
        <button
          onClick={setPageToEnd}
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
