import {
  SkipBackIcon,
  SkipForwardIcon,
  StepBackIcon,
  StepForwardIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import React, { useCallback, useEffect } from 'react';

import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Pagination, PaginationContent, PaginationItem } from '@shared/ui/pagination';

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

  return (
    <span className="inline-flex items-center gap-1 align-middle">
      Page:
      <Pagination className="mx-1 w-auto">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Go to first page"
              onClick={setPageToBeginning}
              disabled={currentPage === 1}
            >
              <SkipBackIcon />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Go to previous page"
              title="Go to Previous Page. Shortcut: Left Arrow Key ←"
              onClick={() => incrementPage(-1)}
              disabled={currentPage === 1}
            >
              <StepBackIcon />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Input
              type="number"
              aria-label="Current page"
              className="w-16 text-center"
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
            />
          </PaginationItem>
          {currentPage && currentPage > totalPages && (
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Go to last page"
                title="This page number is out of range. Showing the first page instead. Click to go to the actual last page."
                onClick={setPageToEnd}
              >
                <TriangleAlertIcon />
              </Button>
            </PaginationItem>
          )}
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Go to next page"
              title="Go to Next Page. Shortcut: Right Arrow Key →"
              onClick={() => incrementPage(1)}
              disabled={!currentPage || currentPage >= totalPages}
            >
              <StepForwardIcon />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Go to last page"
              onClick={setPageToEnd}
              disabled={currentPage === totalPages}
            >
              <SkipForwardIcon />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </span>
  );
};

export default PaginationControls;
