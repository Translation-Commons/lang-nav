import { MoonIcon, SunIcon, MonitorIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import './ThemeToggle.css';
import usePageParams from '@features/params/usePageParams.tsx';

import { PageBrightnessPreference } from '@shared/hooks/usePageBrightness.tsx';

const brightnessOptions: PageBrightnessPreference[] = ['light', 'dark', 'follow device'];

const brightnessLabels: Record<PageBrightnessPreference, string> = {
  light: 'light',
  dark: 'dark',
  'follow device': 'system',
};

const ThemeToggle = () => {
  const { preference, setPreference } = usePageParams().brightness;
  const [localBrightness, setLocalBrightness] = useState<PageBrightnessPreference>(preference);

  useEffect(() => {
    //To avoid  state spamming
    const transitionTimer = setTimeout(() => {
      setPreference(localBrightness);
    }, 500);
    return () => {
      clearTimeout(transitionTimer);
    };
  }, [localBrightness, setPreference]);

  const toggleTheme = () => {
    const currentIndex = brightnessOptions.indexOf(localBrightness);
    const nextBrightness = brightnessOptions[(currentIndex + 1) % brightnessOptions.length];
    setLocalBrightness(nextBrightness);
  };

  const nextBrightness =
    brightnessOptions[(brightnessOptions.indexOf(localBrightness) + 1) % brightnessOptions.length];

  return (
    <button
      type="button"
      className={`theme-toggle ${localBrightness === 'follow device' ? 'system' : localBrightness}`}
      aria-label={`Switch to ${brightnessLabels[nextBrightness]} theme`}
      title={`Switch to ${brightnessLabels[nextBrightness]} theme`}
      onClick={toggleTheme}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <SunIcon className="theme-toggle__track-icon theme-toggle__track-sun" />
        <MoonIcon className="theme-toggle__track-icon theme-toggle__track-moon" />
        <MonitorIcon className="theme-toggle__track-icon theme-toggle__track-system" />
        <span className="theme-toggle__thumb">
          <SunIcon className="theme-toggle__thumb-icon theme-toggle__sun" />
          <MoonIcon className="theme-toggle__thumb-icon theme-toggle__moon" />
          <MonitorIcon className="theme-toggle__thumb-icon theme-toggle__system" />
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
