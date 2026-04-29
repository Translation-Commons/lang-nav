import { MoonIcon, SunIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import usePageParams from '@features/params/usePageParams';

import './GlobalThemeToggle.css';

const THEME_TRANSITION_CLASS = 'theme-transitioning';
const THEME_TRANSITION_MS = 520;
const THEME_TOGGLE_COOLDOWN_MS = 4000;

const GlobalThemeToggle = () => {
  const { pageBrightness, setPreference } = usePageParams().brightness;
  const [visualBrightness, setVisualBrightness] = useState(pageBrightness);
  const [isClickLocked, setIsClickLocked] = useState(false);
  const transitionTimeoutRef = useRef<number | undefined>(undefined);
  const cooldownTimeoutRef = useRef<number | undefined>(undefined);
  const themeFrameRef = useRef<number | undefined>(undefined);
  const isDark = visualBrightness === 'dark';

  // Use the real page theme unless a click animation is currently playing.
  useEffect(() => {
    if (!isClickLocked) setVisualBrightness(pageBrightness);
  }, [isClickLocked, pageBrightness]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== undefined) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      if (cooldownTimeoutRef.current !== undefined) {
        window.clearTimeout(cooldownTimeoutRef.current);
      }
      if (themeFrameRef.current !== undefined) {
        window.cancelAnimationFrame(themeFrameRef.current);
      }
    };
  }, []);

  const toggleTheme = () => {
    if (isClickLocked) return;

    const nextBrightness = isDark ? 'light' : 'dark';

    // Flip the button immediately so the control feels responsive.
    setVisualBrightness(nextBrightness);
    setIsClickLocked(true);

    themeFrameRef.current = window.requestAnimationFrame(() => {
      // Add the global transition class just before changing CSS variables.
      document.documentElement.classList.add(THEME_TRANSITION_CLASS);
      setPreference(nextBrightness);

      transitionTimeoutRef.current = window.setTimeout(() => {
        document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
        transitionTimeoutRef.current = undefined;
      }, THEME_TRANSITION_MS);

      themeFrameRef.current = undefined;
    });

    cooldownTimeoutRef.current = window.setTimeout(() => {
      setIsClickLocked(false);
      cooldownTimeoutRef.current = undefined;
    }, THEME_TOGGLE_COOLDOWN_MS);
  };

  return (
    <button
      type="button"
      className={`global-theme-toggle ${isDark ? 'dark' : 'light'}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      onClick={toggleTheme}
      disabled={isClickLocked}
    >
      <span className="global-theme-toggle__track" aria-hidden="true">
        <SunIcon className="global-theme-toggle__track-icon global-theme-toggle__track-sun" />
        <MoonIcon className="global-theme-toggle__track-icon global-theme-toggle__track-moon" />
        <span className="global-theme-toggle__thumb">
          <SunIcon className="global-theme-toggle__thumb-icon global-theme-toggle__sun" />
          <MoonIcon className="global-theme-toggle__thumb-icon global-theme-toggle__moon" />
        </span>
      </span>
    </button>
  );
};

export default GlobalThemeToggle;
