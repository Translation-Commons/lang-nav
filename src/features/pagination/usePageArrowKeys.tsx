import { useEffect } from 'react';

import usePageParams from '@features/params/usePageParams';

const usePageArrowKeys = () => {
  const { page, updatePageParams } = usePageParams();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        updatePageParams({ page: page + 1 });
      } else if (event.key === 'ArrowLeft' && page > 1) {
        updatePageParams({ page: page - 1 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [page, updatePageParams]);
};

export default usePageArrowKeys;
