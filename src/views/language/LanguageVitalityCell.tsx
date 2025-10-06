import { WifiIcon, WifiHighIcon, WifiLow, WifiOff } from 'lucide-react';
import React from 'react';

import Hoverable from '../../generic/Hoverable';
import { LanguageData } from '../../types/LanguageTypes';

import {
  computeVitalityMetascore,
  getAllVitalityScores,
  getVitalityExplanation,
  VitalityMeterType,
} from './LanguageVitalityComputation';

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
      return <WifiLow size="1em" />;
    case VitalityBucket.Extinct:
      return <WifiOff size="1em" />;
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
  let vitalityScore: number | null = null;
  let hover: React.ReactNode = null;

  if (type === VitalityMeterType.Metascore) {
    const result = computeVitalityMetascore(lang);
    vitalityScore = result.score;
    hover = result.explanation;
  } else {
    const all = getAllVitalityScores(lang);
    vitalityScore = all[type].score;
    hover = getVitalityExplanation(type, lang, vitalityScore);
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
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{vitalityScore ?? '—'}</span>
      </div>
    </Hoverable>
  );
};

export default LanguageVitalityCell;
