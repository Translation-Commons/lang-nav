import { useEffect, useRef } from 'react';

/**
 *  A hook that logs to the console when a component updates, and what values changed. Useful for debugging unnecessary re-renders.
 *  Usage: call `useWhyDidYouUpdate('ComponentName', { prop1, prop2, ... })` in your component, passing in the props and state you want to track.
 *  Note: this is not meant to be used in production, only for debugging during development.
 */
export function useWhyDidYouUpdate(name: string, values: Record<string, unknown>) {
  const previousValues = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (previousValues.current == null) {
      previousValues.current = values;
      return;
    }

    const changes: Record<string, { before: unknown; after: unknown }> = {};

    const allKeys = new Set([...Object.keys(previousValues.current), ...Object.keys(values)]);

    for (const key of allKeys) {
      if (!Object.is(previousValues.current[key], values[key])) {
        changes[key] = {
          before: previousValues.current[key],
          after: values[key],
        };
      }
    }

    if (Object.keys(changes).length > 0) {
      console.group(`[why-did-you-update] ${name}`);
      console.table(
        Object.fromEntries(
          Object.entries(changes).map(([key, value]) => [
            key,
            {
              beforeType: typeof value.before,
              afterType: typeof value.after,
              sameReference: Object.is(value.before, value.after),
            },
          ]),
        ),
      );
      console.log(changes);
      console.groupEnd();
    }

    previousValues.current = values;
  });
}
