import { useEffect, useRef, useState } from 'react';

export function useDebounce({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const suppressDebounce = useRef(false);
  const [internalValue, setInternalValue] = useState(value);
  const debounced = useDebouncedValue(internalValue, 300);

  // Only fire if not suppressed
  useEffect(() => {
    if (suppressDebounce.current) {
      suppressDebounce.current = false;
      return;
    }
    onCommit(debounced);
  }, [debounced]);

  // External update API
  const setValueExternally = (v: string) => {
    suppressDebounce.current = true;
    setInternalValue(v);
  };

  return { internalValue, setInternalValue, setValueExternally };
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
