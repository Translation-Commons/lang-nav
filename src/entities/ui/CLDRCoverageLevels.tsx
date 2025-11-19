import React from 'react';

import { CLDRCoverageLevel } from '@entities/types/CLDRTypes';

export function getCLDRCoverageColor(coverageLevel: CLDRCoverageLevel): string {
  switch (coverageLevel) {
    case CLDRCoverageLevel.Core:
      return 'var(--color-text-secondary)';
    case CLDRCoverageLevel.Basic:
      return 'var(--color-text-yellow)';
    case CLDRCoverageLevel.Moderate:
      return 'var(--color-text-green)';
    case CLDRCoverageLevel.Modern:
      return 'var(--color-text-blue)';
  }
}

function getCoverageLevelExplanation(coverageLevel: CLDRCoverageLevel): string {
  switch (coverageLevel) {
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
      {Object.values(CLDRCoverageLevel).map((level) => (
        <li key={level}>
          <strong style={{ color: getCLDRCoverageColor(level) }}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </strong>
          : {getCoverageLevelExplanation(level)}
        </li>
      ))}
    </ul>
  );
};
