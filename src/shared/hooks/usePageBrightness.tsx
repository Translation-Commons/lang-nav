import { useEffect, useState } from 'react';

export type PageBrightnessPreference = 'light' | 'dark' | 'follow device';
export type PageBrightness = 'light' | 'dark';

export type PageBrightnessParams = {
  preference: PageBrightnessPreference;
  pageBrightness: PageBrightness;
  setPreference: (newPref: PageBrightnessPreference) => void;
};

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export function usePageBrightness(): PageBrightnessParams {
  const getSystemPageBrightness = (): PageBrightness =>
    window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';

  const [preference, setPreference] = useState<PageBrightnessPreference>(() => {
    return (
      (localStorage.getItem('page-brightness') as PageBrightnessPreference | null) ??
      'follow device'
    );
  });
  const [systemBrightness, setSystemBrightness] = useState<PageBrightness>(getSystemPageBrightness);

  // Track the device setting so consumers re-render when it flips. Reading the media
  // query during render instead would leave pageBrightness stale until something else
  // caused a render -- the navbar logo and map tiles would keep their old variant.
  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const apply = () => setSystemBrightness(mediaQuery.matches ? 'dark' : 'light');
    apply();
    mediaQuery.addEventListener('change', apply);
    return () => mediaQuery.removeEventListener('change', apply);
  }, []);

  const pageBrightness = preference === 'follow device' ? systemBrightness : preference;

  // Always put an explicit class on <html>, even when following the device. Tailwind's
  // `dark:` variant and the shadcn token overrides in tailwind.css key off that class,
  // not the media query, so leaving it off renders shadcn components in light colors on
  // a dark page. colors.css keeps its own media query as the pre-hydration fallback.
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(pageBrightness);
  }, [pageBrightness]);

  // Persist preference (not resolved value)
  useEffect(() => {
    localStorage.setItem('page-brightness', preference);
  }, [preference]);

  // Listen to storage changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'page-brightness') return;
      const newPref = (e.newValue as PageBrightnessPreference | null) ?? 'follow device';
      setPreference((prev) => (prev === newPref ? prev : newPref));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Public API
  return {
    preference,
    pageBrightness,
    setPreference,
  };
}
