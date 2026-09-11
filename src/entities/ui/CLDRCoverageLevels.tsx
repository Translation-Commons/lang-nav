import React from 'react';

import { CLDRCoverageLevel } from '@entities/types/CLDRTypes';

export function parseCoverageLevel(level: string): CLDRCoverageLevel {
  switch (level.toLowerCase()) {
    case 'core':
    case '1':
      return CLDRCoverageLevel.Core;
    case 'basic':
    case '2':
      return CLDRCoverageLevel.Basic;
    case 'moderate':
    case '3':
      return CLDRCoverageLevel.Moderate;
    case 'modern':
    case '4':
      return CLDRCoverageLevel.Modern;
    default:
      return CLDRCoverageLevel.Unknown;
  }
}

export function getCoverageLevelName(coverageLevel: CLDRCoverageLevel): string {
  switch (coverageLevel) {
    case CLDRCoverageLevel.Unknown:
      return 'Unknown';
    case CLDRCoverageLevel.Core:
      return 'Core';
    case CLDRCoverageLevel.Basic:
      return 'Basic';
    case CLDRCoverageLevel.Moderate:
      return 'Moderate';
    case CLDRCoverageLevel.Modern:
      return 'Modern';
    default:
      return 'Unknown';
  }
}

export function getCLDRCoverageColor(coverageLevel: CLDRCoverageLevel): string {
  switch (coverageLevel) {
    case CLDRCoverageLevel.Unknown:
      return 'var(--color-text-secondary)';
    case CLDRCoverageLevel.Core:
      return 'var(--color-orange)';
    case CLDRCoverageLevel.Basic:
      return 'var(--color-yellow)';
    case CLDRCoverageLevel.Moderate:
      return 'var(--color-green)';
    case CLDRCoverageLevel.Modern:
      return 'var(--color-blue)';
  }
}

function getCoverageLevelExplanation(coverageLevel: CLDRCoverageLevel): string {
  switch (coverageLevel) {
    case CLDRCoverageLevel.Unknown:
      return 'This language is not in the CLDR system (or there is a data error).';
    case CLDRCoverageLevel.Core:
      return 'Core data like the letters in the alphabet, the name, demographics, and basic time formatting.';
    case CLDRCoverageLevel.Basic:
      return 'Common date, time and currency formatting, as well as core strings for basic UI elements.';
    case CLDRCoverageLevel.Moderate:
      return 'Translations of country names, language names, timezones, calendars. Additional number formatting.';
    case CLDRCoverageLevel.Modern:
      return 'Emoji, advanced number formats, measurement units.';
  }
}

export const CoverageLevelsExplanation: React.FC = () => {
  return (
    <ul>
      {Object.values(CLDRCoverageLevel)
        .filter((level) => typeof level === 'number')
        .map((level) => (
          <li key={level}>
            <strong style={{ color: getCLDRCoverageColor(level) }}>
              {getCoverageLevelName(level)}
            </strong>
            : {getCoverageLevelExplanation(level)}
          </li>
        ))}
    </ul>
  );
};
