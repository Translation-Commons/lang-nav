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
  store: 'session' | 'local' = 'session', // "Session" will only persist in the tab, "Local" will persist across tabs
): UseStoredParamsReturn<T> {
  const resolveDefault = useCallback(() => {
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
  }, [defaultValue]);

  const read = useCallback((): T => {
    try {
      const raw = store === 'session' ? sessionStorage.getItem(key) : localStorage.getItem(key);
      if (raw == null) return resolveDefault();
      return JSON.parse(raw) as T;
    } catch {
      // if parse fails, reset to default
      return resolveDefault();
    }
  }, [key, resolveDefault, store]);

  const [value, setValueState] = useState<T>(() => read());

  // write to local/sessionStorage when value changes
  useEffect(() => {
    try {
      if (store === 'session') {
        sessionStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // ignore quota / serialization errors
    }
  }, [key, value, store]);

  // listen for storage events to sync across tabs
  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (store === 'session') return; // sessionStorage is per-tab only
      if (e.storageArea !== localStorage) return;
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
  }, [key, resolveDefault, store]);

  const setValue = useCallback(
    (updater: Updater<T>) => {
      setValueState((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
        try {
          if (store === 'session') {
            sessionStorage.setItem(key, JSON.stringify(next));
          } else {
            localStorage.setItem(key, JSON.stringify(next));
          }
        } catch {
          // ignore
        }
        return next;
      });
    },
    [key, store],
  );

  const clear = useCallback(() => {
    const def = resolveDefault();
    try {
      if (store === 'session') {
        sessionStorage.setItem(key, JSON.stringify(def));
      } else {
        localStorage.setItem(key, JSON.stringify(def));
      }
    } catch {
      // ignore
    }
    setValueState(def);
  }, [key, resolveDefault, store]);

  const remove = useCallback(() => {
    try {
      if (store === 'session') {
        sessionStorage.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
    setValueState(resolveDefault());
  }, [key, resolveDefault, store]);

  return { value, setValue, clear, remove };
}
