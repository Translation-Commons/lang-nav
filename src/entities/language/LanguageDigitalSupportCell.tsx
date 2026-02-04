import React from 'react';

import ActivityLevelDisplay, { ActivityLevel } from '@shared/ui/ActivityLevelDisplay';
import LinkButton from '@shared/ui/LinkButton';

import {
  getDigitalSupportDescription,
  getDigitalSupportLabel,
} from '@strings/DigitalSupportStrings';

import { EthnologueDigitalSupport, LanguageData } from './LanguageTypes';

const LanguageDigitalSupportCell: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { digitalSupport } = lang.Ethnologue;

  return (
    <ActivityLevelDisplay
      level={getActivityLevel(digitalSupport)}
      label={getDigitalSupportLabel(digitalSupport) ?? '-'}
      description={getDigitalSupportDescription(digitalSupport)}
    />
  );
};

function getActivityLevel(digitalSupport?: EthnologueDigitalSupport): ActivityLevel {
  if (digitalSupport == null) return ActivityLevel.Unknown;
  switch (digitalSupport) {
    case EthnologueDigitalSupport.Thriving:
      return ActivityLevel.High;
    case EthnologueDigitalSupport.Vital:
      return ActivityLevel.Medium;
    case EthnologueDigitalSupport.Emerging:
    case EthnologueDigitalSupport.Ascending:
      return ActivityLevel.Low;
    case EthnologueDigitalSupport.Still:
      return ActivityLevel.Zero;
  }
}

export const LanguageDigitalSupportDescription: React.FC = () => {
  return (
    <div>
      This indicates the level of digital support for the language as assessed by Ethnologue,
      estimates from March 2025. Hover over to see what each level generally means.
      <LinkButton href="https://www.ethnologue.com/methodology/#DLS">
        Ethnologue Methodology
      </LinkButton>
    </div>
  );
};

export default LanguageDigitalSupportCell;
