import { useEffect, useState } from 'react';

export type PageBrightnessPreference = 'light' | 'dark' | 'follow device';
export type PageBrightness = 'light' | 'dark';

export type PageBrightnessParams = {
  preference: PageBrightnessPreference;
  pageBrightness: PageBrightness;
  setPreference: (newPref: PageBrightnessPreference) => void;
};

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';
const STORAGE_KEY = 'page-brightness';

// Browsers throw on localStorage when the user blocks site data for the origin. This hook
// runs in PageParamsProvider at the root of the app, so letting that escape would white
// screen the whole page rather than just lose the setting.
function readStoredPreference(): PageBrightnessPreference {
  try {
    return (
      (localStorage.getItem(STORAGE_KEY) as PageBrightnessPreference | null) ?? 'follow device'
    );
  } catch {
    return 'follow device';
  }
}

function storePreference(preference: PageBrightnessPreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // The preference still applies for this session, it just will not survive a reload.
  }
}

export function usePageBrightness(): PageBrightnessParams {
  const getSystemPageBrightness = (): PageBrightness =>
    window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';

  const [preference, setPreference] = useState<PageBrightnessPreference>(readStoredPreference);
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
  // `dark:` variant and the theme tokens in tailwind.css key off that class, not the media
  // query, so leaving it off renders the page in light colors on a dark device. Nothing in
  // the CSS keys off prefers-color-scheme any more -- the inline script in index.html is
  // what covers the render before this effect runs, so do not remove it.
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(pageBrightness);
  }, [pageBrightness]);

  // Persist preference (not resolved value)
  useEffect(() => {
    storePreference(preference);
  }, [preference]);

  // Listen to storage changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
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
