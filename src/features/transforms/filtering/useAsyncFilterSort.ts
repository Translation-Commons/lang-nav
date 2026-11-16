import { useEffect, useState } from 'react';

type Options<T> = {
  items: readonly T[];
  predicate: (item: T) => boolean;
  compare: (a: T, b: T) => number;
  chunkSize?: number;
};

type Result<T> = {
  items: T[];
  isPending: boolean;
  error: unknown;
};

const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Filters and stable-sorts large arrays in interruptible chunks on the main thread. */
function useAsyncFilterSort<T>({
  items: inputItems,
  predicate,
  compare,
  chunkSize = 512,
}: Options<T>): Result<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<unknown>(undefined);

  useEffect(() => {
    let cancelled = false;
    setIsPending(true);
    setError(undefined);

    const run = async () => {
      try {
        const filtered: T[] = [];
        for (let start = 0; start < inputItems.length; start += chunkSize) {
          if (cancelled) return;
          const end = Math.min(start + chunkSize, inputItems.length);
          for (let i = start; i < end; i += 1) {
            const item = inputItems[i];
            if (predicate(item)) filtered.push(item);
          }
          if (end < inputItems.length) await yieldToBrowser();
        }

        // Bottom-up stable merge sort. Unlike Array.sort, each pass yields
        // periodically so large comparisons do not monopolize the main thread.
        let source = filtered;
        let destination = new Array<T>(filtered.length);
        let operationsSinceYield = 0;
        for (let width = 1; width < filtered.length; width *= 2) {
          for (let left = 0; left < filtered.length; left += width * 2) {
            if (cancelled) return;
            const middle = Math.min(left + width, filtered.length);
            const right = Math.min(left + width * 2, filtered.length);
            let a = left;
            let b = middle;

            for (let out = left; out < right; out += 1) {
              if (a < middle && (b >= right || compare(source[a], source[b]) <= 0)) {
                destination[out] = source[a++];
              } else {
                destination[out] = source[b++];
              }

              operationsSinceYield += 1;
              if (operationsSinceYield >= chunkSize) {
                operationsSinceYield = 0;
                await yieldToBrowser();
                if (cancelled) return;
              }
            }
          }
          [source, destination] = [destination, source];
        }

        if (!cancelled) {
          setItems(source);
          setIsPending(false);
        }
      } catch (runError) {
        if (!cancelled) {
          setError(runError);
          setIsPending(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [inputItems, predicate, compare, chunkSize]);

  return { items, isPending, error };
}

export default useAsyncFilterSort;
