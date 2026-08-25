import { SkipBackIcon, SkipForwardIcon, StepBackIcon, StepForwardIcon } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';

import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';
import { ButtonGroup } from '@shared/ui/button-group';
import { Input } from '@shared/ui/input';

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
    <span className="inline text-nowrap">
      <ButtonGroup>
        <Button disabled variant="outline">
          Page
        </Button>
        <Button
          className="cursor-pointer"
          disabled={currentPage === 1}
          onClick={setPageToBeginning}
          variant="secondary"
        >
          <SkipBackIcon />
        </Button>
        <Button
          className="cursor-pointer"
          disabled={currentPage === 1}
          onClick={() => incrementPage(-1)}
          variant="secondary"
        >
          <StepBackIcon />
        </Button>
        <Input
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
          style={{ width: 50, textAlign: 'center' }}
        />
        <Button
          className="cursor-pointer"
          disabled={!currentPage || currentPage >= totalPages}
          onClick={() => incrementPage(1)}
          variant="secondary"
        >
          <StepForwardIcon />
        </Button>
        <Button
          className="cursor-pointer"
          disabled={currentPage === totalPages}
          onClick={setPageToEnd}
          variant="secondary"
        >
          <SkipForwardIcon />
        </Button>
        <Button disabled variant="outline">
          / {totalPages}
        </Button>
      </ButtonGroup>
    </span>
  );
};

export default PaginationControls;
