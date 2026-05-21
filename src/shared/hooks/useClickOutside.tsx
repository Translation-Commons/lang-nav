import { useEffect, useRef } from 'react';

// Custom hook that returns a ref and calls the callback when a mousedown occurs outside the referenced element.

export function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleEvent(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handleEvent);
    return () => {
      document.removeEventListener('mousedown', handleEvent);
    };
  }, [callback]);
  return ref;
}
