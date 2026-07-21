import { WifiHighIcon, WifiIcon, WifiLowIcon, WifiZeroIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { cn } from '@shared/lib/utils';

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
    <Hoverable hoverContent={description}>
      <div className={cn('flex items-center gap-1', getColorClass(level))}>
        <ActivityIcon bucket={level} />
        <span>{label}</span>
      </div>
    </Hoverable>
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

function getColorClass(level: ActivityLevel): string {
  switch (level) {
    case ActivityLevel.High:
      return 'text-green';
    case ActivityLevel.Medium:
      return 'text-yellow';
    case ActivityLevel.Low:
      return 'text-orange';
    case ActivityLevel.Zero:
      return 'text-red';
    case ActivityLevel.Unknown:
      return 'text-muted-foreground';
  }
}

export default ActivityLevelDisplay;
