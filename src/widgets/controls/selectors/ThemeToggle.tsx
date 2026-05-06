import { MoonIcon, SunIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import './ThemeToggle.css';
import usePageParams from '@features/params/usePageParams.tsx';

const ThemeToggle = () => {
  const { pageBrightness, setPreference } = usePageParams().brightness;
  const [localBrightness, setLocalBrightness] = useState(pageBrightness);
  const isDark = localBrightness === 'dark';

  useEffect(() => {
    //To avoid  state spamming
    const transitionTimer = setTimeout(() => {
      setPreference(localBrightness);
    }, 500);
    return () => {
      clearTimeout(transitionTimer);
    };
  }, [localBrightness]);

  const toggleTheme = () => {
    const nextBrightness = isDark ? 'light' : 'dark';
    setLocalBrightness(nextBrightness);
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      onClick={toggleTheme}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <SunIcon className="theme-toggle__track-icon theme-toggle__track-sun" />
        <MoonIcon className="theme-toggle__track-icon theme-toggle__track-moon" />
        <span className="theme-toggle__thumb">
          <SunIcon className="theme-toggle__thumb-icon theme-toggle__sun" />
          <MoonIcon className="theme-toggle__thumb-icon theme-toggle__moon" />
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
