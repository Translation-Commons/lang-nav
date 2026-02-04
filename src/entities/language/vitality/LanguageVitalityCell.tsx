import React from 'react';

import ActivityLevelDisplay, { ActivityLevel } from '@shared/ui/ActivityLevelDisplay';

import { LanguageData } from '../LanguageTypes';

import { getVitalityScore } from './LanguageVitalityComputation';
import VitalityExplanation from './VitalityExplanation';
import { getVitalityLabel } from './VitalityStrings';
import { VitalitySource } from './VitalityTypes';

export interface LanguageVitalityCellProps {
  lang: LanguageData;
  src: VitalitySource;
}
const LanguageVitalityCell: React.FC<LanguageVitalityCellProps> = ({ lang, src }) => {
  return (
    <ActivityLevelDisplay
      level={getActivityLevel(getVitalityScore(src, lang))}
      label={getVitalityLabel(lang, src) ?? '—'}
      description={<VitalityExplanation source={src} lang={lang} />}
    />
  );
};

function getActivityLevel(score: number | undefined): ActivityLevel {
  if (score == null) return ActivityLevel.Unknown;
  if (score >= 7) return ActivityLevel.High;
  if (score >= 4) return ActivityLevel.Medium;
  if (score >= 1) return ActivityLevel.Low;
  return ActivityLevel.Zero;
}

export default LanguageVitalityCell;
