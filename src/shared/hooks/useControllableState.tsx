import { useCallback, useEffect, useRef, useState } from 'react';

type UseControllableStateParams<T> = {
  /** The controlled value. Leave undefined to let the hook own the state. */
  prop?: T;
  /** The starting value when uncontrolled. */
  defaultProp: T;
  onChange?: (value: T) => void;
};

/**
 * Lets a component work either controlled or uncontrolled, so callers can pass `value` and
 * drive it from their own state, or leave it off and let the component remember its own.
 *
 * Base UI provides this through its components rather than as a standalone hook, so shared
 * components that are not built on a Base UI primitive use this instead.
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>): [T, (next: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledValue;

  // Read onChange through a ref so setValue stays referentially stable even when callers
  // pass an inline arrow, which is the common case. Depending on onChange directly would
  // make this useCallback -- and every memo built on top of it -- do nothing.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolledValue(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  useEffect(() => {
    if (import.meta.env.DEV && isControlled && onChange == null) {
      console.warn(
        'useControllableState: a value was passed without an onChange, so the component is ' +
          'stuck on that value and user interaction cannot change it. Pass onChange to ' +
          'control it, or defaultProp to leave it uncontrolled.',
      );
    }
  }, [isControlled, onChange]);

  return [value, setValue];
}
