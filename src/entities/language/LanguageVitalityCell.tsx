import { WifiIcon, WifiHighIcon, WifiLowIcon, WifiOffIcon } from 'lucide-react';
import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import Hoverable from '@shared/ui/Hoverable';

import { getAllVitalityScores, VitalityMeterType } from './LanguageVitalityComputation';

export interface LanguageVitalityCellProps {
  lang: LanguageData;
  type: VitalityMeterType;
}

export enum VitalityBucket {
  Strong = 'Strong',
  Medium = 'Medium',
  Low = 'Low',
  Extinct = 'Extinct',
  Unknown = 'Unknown',
}

function getScoreBucket(score: number | null): VitalityBucket {
  if (score === null) return VitalityBucket.Unknown;
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
      return <WifiOffIcon size="1em" />;
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
  const { score: vitalityScore, explanation: hover, label } = getAllVitalityScores(lang)[type];
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
          {type === VitalityMeterType.Metascore
            ? (vitalityScore?.toFixed(1) ?? '—')
            : (label ?? '—')}
        </span>
      </div>
    </Hoverable>
  );
};

export default LanguageVitalityCell;
