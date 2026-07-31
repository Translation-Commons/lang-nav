import { useCallback, useState } from 'react';

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

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [value, setValue];
}
