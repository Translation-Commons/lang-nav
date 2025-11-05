import { WifiIcon, WifiHighIcon, WifiLowIcon, WifiZeroIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';

import { LanguageData, LanguageScope } from '../LanguageTypes';

import { getFamilyVitalityScores } from './LanguageFamilyVitalityComputation';
import { getAllVitalityScores } from './LanguageVitalityComputation';
import { VitalitySource } from './VitalityTypes';

export interface LanguageVitalityCellProps {
  lang: LanguageData;
  type: VitalitySource;
}

export enum VitalityBucket {
  Strong = 'Strong',
  Medium = 'Medium',
  Low = 'Low',
  Extinct = 'Extinct',
  Unknown = 'Unknown',
}

function getScoreBucket(score: number | undefined): VitalityBucket {
  if (score == null) return VitalityBucket.Unknown;
  if (score >= 7) return VitalityBucket.Strong;
  if (score >= 4) return VitalityBucket.Medium;
  if (score >= 1) return VitalityBucket.Low;
  return VitalityBucket.Extinct;
}

const BucketIcon: React.FC<{ bucket: VitalityBucket }> = ({ bucket }) => {
  switch (bucket) {
    case VitalityBucket.Strong:
      return <WifiIcon size="1em" />;
    case VitalityBucket.Medium:
      return <WifiHighIcon size="1em" />;
    case VitalityBucket.Low:
      return <WifiLowIcon size="1em" />;
    case VitalityBucket.Extinct:
      return <WifiZeroIcon size="1em" />;
    case VitalityBucket.Unknown:
    default:
      return null;
  }
};

function bucketColor(bucket: VitalityBucket): string {
  switch (bucket) {
    case VitalityBucket.Strong:
      return 'var(--color-text-green)';
    case VitalityBucket.Medium:
      return 'var(--color-text-yellow)';
    case VitalityBucket.Low:
      return 'var(--color-text-orange)';
    case VitalityBucket.Extinct:
      return 'var(--color-text-red)';
    case VitalityBucket.Unknown:
      return 'var(--color-text-secondary)';
  }
}

const LanguageVitalityCell: React.FC<LanguageVitalityCellProps> = ({ lang, type }) => {
  let vitalityScore: number | undefined;
  let hover: React.ReactNode;
  let label: string | undefined;

  if (lang.scope === LanguageScope.Family) {
    ({ score: vitalityScore, explanation: hover, label } = getFamilyVitalityScores(lang)[type]);
  } else {
    ({ score: vitalityScore, explanation: hover, label } = getAllVitalityScores(lang)[type]);
  }
  const bucket = getScoreBucket(vitalityScore);

  return (
    <Hoverable hoverContent={hover}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25em',
          color: bucketColor(bucket),
        }}
      >
        <BucketIcon bucket={bucket} />
        <span>
          {type === VitalitySource.Metascore ? (vitalityScore?.toFixed(1) ?? '—') : (label ?? '—')}
        </span>
      </div>
    </Hoverable>
  );
};

export default LanguageVitalityCell;
