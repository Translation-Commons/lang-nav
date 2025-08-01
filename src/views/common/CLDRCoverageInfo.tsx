import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircleIcon } from 'lucide-react';
import React from 'react';

import Deemphasized from '../../generic/Deemphasized';
import Hoverable from '../../generic/Hoverable';
import { CLDRCoverageLevel } from '../../types/CLDRTypes';
import { LocaleData } from '../../types/DataTypes';
import { LanguageData } from '../../types/LanguageTypes';
import { ObjectType } from '../../types/PageParamTypes';

export const CLDRCoverageText: React.FC<{
  object: LanguageData | LocaleData;
  parentNotes?: React.ReactNode;
}> = ({ object, parentNotes }) => {
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
        />
      );
    }
    return (
      <>
        <NotesIcon warningNotes={parentNotes} infoNotes={CLDR.notes} />
        <Deemphasized>Not supported by CLDR.</Deemphasized>
      </>
    );
  }

  const coverageLevel = cldrCoverage.actualCoverageLevel;
  const capitalizedLevel = coverageLevel.charAt(0).toUpperCase() + coverageLevel.slice(1);

  return (
    <>
      <NotesIcon warningNotes={parentNotes} infoNotes={CLDR.notes} />{' '}
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
    return <Deemphasized>N/A</Deemphasized>;
  }

  return (
    <>
      {' '}
      {cldrCoverage.inICU ? (
        <CheckCircle2Icon
          style={{ color: 'var(--color-text-green)', verticalAlign: 'middle' }}
          size={'1em'}
        />
      ) : (
        <XCircleIcon
          style={{ color: 'var(--color-text-red)', verticalAlign: 'middle' }}
          size={'1em'}
        />
      )}
    </>
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
    <Hoverable
      hoverContent={formattedNotes}
      style={{ textDecoration: 'none', marginRight: '0.25em' }}
    >
      {warningNotes ? (
        <AlertTriangleIcon
          style={{ color: 'var(--color-text-yellow)', verticalAlign: 'middle' }}
          size={'1em'}
        />
      ) : (
        <InfoIcon
          style={{ color: 'var(--color-text-blue)', verticalAlign: 'middle' }}
          size={'1em'}
        />
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
