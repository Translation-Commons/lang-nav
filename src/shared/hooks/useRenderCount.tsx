import { useRef } from 'react';

/**
 * A hook that logs to the console how many times a component has rendered. Useful for debugging unnecessary re-renders.
 * Usage: call `useRenderCount('ComponentName')` in your component.
 * Note: this is not meant to be used in production, only for debugging during development.
 */
export function useRenderCount(name: string) {
  const count = useRef(0);
  count.current += 1;

  console.log(`${name} render #${count.current}`);
}
