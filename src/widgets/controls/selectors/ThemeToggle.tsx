import usePageParams from '@features/params/usePageParams.tsx';

import { PageBrightnessPreference } from '@shared/hooks/usePageBrightness.tsx';
import { ThemeSwitcher, type Theme } from '@shared/ui/theme-switcher.tsx';

// The switcher speaks the conventional light/dark/system vocabulary; the app stores
// 'follow device'. Only the names differ.
const toTheme = (preference: PageBrightnessPreference): Theme =>
  preference === 'follow device' ? 'system' : preference;

const toPreference = (theme: Theme): PageBrightnessPreference =>
  theme === 'system' ? 'follow device' : theme;

const ThemeToggle = () => {
  const { preference, setPreference } = usePageParams().brightness;

  return (
    <ThemeSwitcher
      aria-label="Page Brightness"
      value={toTheme(preference)}
      onChange={(theme) => setPreference(toPreference(theme))}
    />
  );
};

export default ThemeToggle;
