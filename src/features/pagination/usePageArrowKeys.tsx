import { useEffect } from 'react';

import usePageParams from '@features/params/usePageParams';

const usePageArrowKeys = () => {
  const { page, updatePageParams } = usePageParams();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // If the event target is an input, do not navigate pages
      const target = event.target;
      if (target !== null && target instanceof HTMLElement) {
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
      }

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
