import { useCallback, useEffect, useState } from 'react';

type Updater<T> = T | ((prev: T) => T);

export interface UseStoredParamsReturn<T> {
  value: T;
  setValue: (updater: Updater<T>) => void;
  clear: () => void;
  remove: () => void;
}

/**
 * Persist a value in sessionStorage under `key`.
 *
 * Usage:
 * const { value, setValue, clear } = useStoredParams<MyType>('my-key', defaultValue);
 */
export default function useStoredParams<T>(
  key: string,
  defaultValue: T | (() => T),
): UseStoredParamsReturn<T> {
  const resolveDefault = useCallback(() => {
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
  }, [defaultValue]);

  const read = useCallback((): T => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw == null) return resolveDefault();
      return JSON.parse(raw) as T;
    } catch {
      // if parse fails, reset to default
      return resolveDefault();
    }
  }, [key, resolveDefault]);

  const [value, setValueState] = useState<T>(() => read());

  // write to sessionStorage when value changes
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota / serialization errors
    }
  }, [key, value]);

  // listen for storage events to sync across tabs
  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (e.storageArea !== sessionStorage) return;
      if (e.key !== key) return;
      try {
        if (e.newValue == null) {
          setValueState(resolveDefault());
        } else {
          setValueState(JSON.parse(e.newValue) as T);
        }
      } catch {
        setValueState(resolveDefault());
      }
    };
    window.addEventListener('storage', handle);
    return () => window.removeEventListener('storage', handle);
  }, [key, resolveDefault]);

  const setValue = useCallback(
    (updater: Updater<T>) => {
      setValueState((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
        try {
          sessionStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [key],
  );

  const clear = useCallback(() => {
    const def = resolveDefault();
    try {
      sessionStorage.setItem(key, JSON.stringify(def));
    } catch {
      // ignore
    }
    setValueState(def);
  }, [key, resolveDefault]);

  const remove = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    setValueState(resolveDefault());
  }, [key, resolveDefault]);

  return { value, setValue, clear, remove };
}
