import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useCallback } from 'react';

import { useControllableState } from '@shared/hooks/useControllableState';
import { cn } from '@shared/lib/utils';

export type Theme = 'light' | 'dark' | 'system';

const themes = [
  {
    key: 'system',
    icon: MonitorIcon,
    label: 'System theme',
  },
  {
    key: 'light',
    icon: SunIcon,
    label: 'Light theme',
  },
  {
    key: 'dark',
    icon: MoonIcon,
    label: 'Dark theme',
  },
] as const;

export type ThemeSwitcherProps = {
  value?: Theme;
  onChange?: (theme: Theme) => void;
  defaultValue?: Theme;
  className?: string;
  /** Names the group of options. Screen readers announce it before each option. */
  'aria-label'?: string;
};

export const ThemeSwitcher = ({
  value,
  onChange,
  defaultValue = 'system',
  className,
  'aria-label': ariaLabel = 'Theme',
}: ThemeSwitcherProps) => {
  const [theme, setTheme] = useControllableState<Theme>({
    defaultProp: defaultValue,
    prop: value,
    onChange,
  });

  const handleThemeClick = useCallback(
    (themeKey: Theme) => {
      setTheme(themeKey);
    },
    [setTheme],
  );

  // One indicator that slides between slots, rather than one per button, so moving
  // between themes animates instead of the highlight jumping.
  const activeIndex = themes.findIndex(({ key }) => key === theme);

  return (
    <div
      // The options are one setting, not three unrelated toggles. Without a group a screen
      // reader announces them with nothing tying them together.
      role="group"
      aria-label={ariaLabel}
      data-slot="theme-switcher"
      className={cn(
        'relative isolate flex h-8 w-fit rounded-full bg-background p-1 ring-1 ring-border',
        className,
      )}
    >
      {activeIndex >= 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-1 rounded-full bg-secondary transition-transform duration-300 ease-out"
          style={{
            width: `calc((100% - 0.5rem) / ${themes.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      )}
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <button
            aria-label={label}
            aria-pressed={isActive}
            // data-slot exempts this from the legacy global button styling in
            // component_styles.css, which would otherwise paint each option as a grey box.
            data-slot="theme-switcher-option"
            className="relative h-6 w-6 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            key={key}
            onClick={() => handleThemeClick(key)}
            title={label}
            type="button"
          >
            <Icon
              className={cn(
                'relative z-10 m-auto h-4 w-4 transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
