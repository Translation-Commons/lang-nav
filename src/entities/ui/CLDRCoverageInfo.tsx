import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircleIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';
import { ObjectType } from '@features/page-params/PageParamTypes';

import { LanguageData } from '@entities/language/LanguageTypes';
import { CLDRCoverageLevel } from '@entities/types/CLDRTypes';
import { LocaleData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';

type verbosity = 'coverage level' | 'count of locales' | 'full';

export const CLDRCoverageText: React.FC<{
  object: LanguageData | LocaleData;
  parentNotes?: React.ReactNode;
  verbosity?: verbosity;
}> = ({ object, parentNotes, verbosity = 'full' }) => {
  if (object.type !== ObjectType.Language) {
    return null;
  }

  const {
    cldrCoverage,
    cldrDataProvider,
    sourceSpecific: { CLDR },
  } = object;

  if (cldrCoverage == null) {
    if (cldrDataProvider != null) {
      return (
        <CLDRCoverageText
          object={cldrDataProvider}
          parentNotes={[parentNotes, CLDR.notes].filter((n) => n != null)}
          verbosity={verbosity}
        />
      );
    }
    return (
      <>
        <NotesIcon warningNotes={parentNotes} infoNotes={CLDR.notes} />
        <Deemphasized>{verbosity === 'full' ? 'Not supported by CLDR.' : 'n/a'}</Deemphasized>
      </>
    );
  }

  const coverageLevel = cldrCoverage.actualCoverageLevel;
  const capitalizedLevel = coverageLevel.charAt(0).toUpperCase() + coverageLevel.slice(1);

  const warnings = <NotesIcon warningNotes={parentNotes} infoNotes={CLDR.notes} />;

  if (verbosity == 'coverage level') {
    return (
      <>
        {warnings}{' '}
        <span style={{ color: getCLDRCoverageColor(cldrCoverage.actualCoverageLevel) }}>
          {capitalizedLevel}
        </span>
      </>
    );
  } else if (verbosity == 'count of locales') {
    return (
      <>
        {warnings} {cldrCoverage.countOfCLDRLocales}
      </>
    );
  }

  return (
    <>
      {warnings}{' '}
      <span style={{ color: getCLDRCoverageColor(cldrCoverage.actualCoverageLevel) }}>
        {capitalizedLevel}
      </span>{' '}
      coverage by {cldrCoverage.countOfCLDRLocales} locale
      {cldrCoverage.countOfCLDRLocales > 1 && 's'}.
    </>
  );
};

export const ICUSupportStatus: React.FC<{ object: LanguageData | LocaleData }> = ({ object }) => {
  if (object.type !== ObjectType.Language) {
    return null;
  }

  const { cldrCoverage, cldrDataProvider } = object;

  if (cldrCoverage == null) {
    if (cldrDataProvider != null) {
      return <ICUSupportStatus object={cldrDataProvider} />;
    }
    return <Deemphasized>n/a</Deemphasized>;
  }

  return cldrCoverage.inICU ? (
    <CheckCircle2Icon
      style={{ color: 'var(--color-text-green)', verticalAlign: 'middle' }}
      size={'1em'}
    />
  ) : (
    <XCircleIcon style={{ color: 'var(--color-text-red)', verticalAlign: 'middle' }} size={'1em'} />
  );
};

// CLDR support may have special notes, like something is not directly supported but its supported by a similar language.
// Notes may come in 2 varieties: info and warning.
// - Info notes are shown as a blue info icon (ⓘ). Usually these are context (like this language supports others)
// - Warning notes are shown as a yellow warning icon (⚠️).
const NotesIcon: React.FC<{
  infoNotes?: React.ReactNode;
  warningNotes?: React.ReactNode;
}> = ({ infoNotes, warningNotes }) => {
  if (!infoNotes && !warningNotes) return null;
  let formattedNotes = warningNotes ?? infoNotes;
  if (Array.isArray(formattedNotes)) {
    formattedNotes = (
      <div style={{ display: 'flex', gap: '0.5em', flexDirection: 'column' }}>
        {formattedNotes.map((note, index) => (
          <div key={index}>{note}</div>
        ))}
      </div>
    );
  }
  return (
    <Hoverable hoverContent={formattedNotes} style={{ textDecoration: 'none' }}>
      {warningNotes ? (
        <AlertTriangleIcon
          style={{ color: 'var(--color-text-yellow)', verticalAlign: 'sub' }}
          size={'1em'}
        />
      ) : (
        <InfoIcon style={{ color: 'var(--color-text-blue)', verticalAlign: 'sub' }} size={'1em'} />
      )}
    </Hoverable>
  );
};

function getCLDRCoverageColor(coverageLevel: CLDRCoverageLevel): string {
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
