import { WifiHighIcon, WifiIcon, WifiLowIcon, WifiZeroIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

export enum ActivityLevel {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Zero = 'Zero',
  Unknown = 'Unknown',
}

type Props = {
  level: ActivityLevel;
  label: string;
  description?: React.ReactNode;
};

const ActivityLevelDisplay: React.FC<Props> = ({ level, label, description }) => {
  return (
    <HoverableButton hoverContent={description} variant="ghost" style={{ color: getColor(level) }}>
      <ActivityIcon bucket={level} />
      {label}
    </HoverableButton>
  );
};

const ActivityIcon: React.FC<{ bucket: ActivityLevel }> = ({ bucket }) => {
  switch (bucket) {
    case ActivityLevel.High:
      return <WifiIcon size="1em" />;
    case ActivityLevel.Medium:
      return <WifiHighIcon size="1em" />;
    case ActivityLevel.Low:
      return <WifiLowIcon size="1em" />;
    case ActivityLevel.Zero:
      return <WifiZeroIcon size="1em" />;
    case ActivityLevel.Unknown:
    default:
      return null;
  }
};

function getColor(level: ActivityLevel): string {
  switch (level) {
    case ActivityLevel.High:
      return 'var(--color-green)';
    case ActivityLevel.Medium:
      return 'var(--color-yellow)';
    case ActivityLevel.Low:
      return 'var(--color-orange)';
    case ActivityLevel.Zero:
      return 'var(--color-red)';
    case ActivityLevel.Unknown:
      return 'var(--color-text-secondary)';
  }
}

export default ActivityLevelDisplay;
