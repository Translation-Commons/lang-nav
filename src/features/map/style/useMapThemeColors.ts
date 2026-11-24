import { useEffect, useState } from 'react';

import usePageParams from '@features/params/usePageParams';

import { resolveCssColor } from './resolveCssColor';

export type MapThemeColors = {
  ocean: string;
  land: string;
  border: string;
  primary: string;
  secondary: string;
  text: string;
};

function readThemeColors(isDark: boolean): MapThemeColors {
  return {
    ocean: resolveCssColor('var(--color-background)'),
    // Neutral grey land; dark mode uses its inverse.
    land: isDark ? '#434343' : '#bcbcbc',
    border: resolveCssColor('var(--color-background)'),
    primary: resolveCssColor('var(--color-button-primary)'),
    secondary: resolveCssColor('var(--color-button-secondary)'),
    text: resolveCssColor('var(--color-foreground)'),
  };
}

/** The page's theme colours, as plain rgba() strings the map can paint with. */
function useMapThemeColors(): MapThemeColors {
  const { pageBrightness } = usePageParams().brightness;
  const isDark = pageBrightness === 'dark';
  const [colors, setColors] = useState(() => readThemeColors(isDark));

  useEffect(() => {
    // The theme class on <html> is swapped by an effect higher up the tree, which runs after
    // this one, so wait a frame before reading the new colours.
    const frame = requestAnimationFrame(() => {
      const next = readThemeColors(isDark);
      // A new object restyles the whole map, so keep the old one if nothing changed.
      setColors((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
    });
    return () => cancelAnimationFrame(frame);
  }, [isDark]);

  return colors;
}

export default useMapThemeColors;
