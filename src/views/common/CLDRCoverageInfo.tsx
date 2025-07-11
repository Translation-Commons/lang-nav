import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

import Hoverable from '../../generic/Hoverable';
import { CLDRCoverageLevel } from '../../types/CLDRTypes';
import { LocaleData } from '../../types/DataTypes';
import { LanguageData } from '../../types/LanguageTypes';
import { ObjectType } from '../../types/PageParamTypes';

type Props = {
  object: LanguageData | LocaleData;
  parentNotes?: React.ReactNode; // Notes from something referencing this cldr coverage.
};

export const CLDRCoverageInfo: React.FC<Props> = ({ object, parentNotes }) => {
  if (object.type !== ObjectType.Language) {
    return 'TODO: CLDRCoverageInfo for LocaleData';
  }

  const {
    cldrCoverage,
    cldrDataProvider,
    schemaSpecific: { CLDR },
  } = object;

  if (cldrCoverage == null) {
    if (cldrDataProvider != null) {
      return (
        <CLDRCoverageInfo
          object={cldrDataProvider}
          parentNotes={[parentNotes, CLDR.notes].filter((n) => n != null)}
        />
      );
    }
    return (
      <>
        <NotesIcon warningNotes={parentNotes} infoNotes={CLDR.notes} />
        <span className="unsupported">Not supported by CLDR or ICU.</span>
      </>
    );
  }

  return (
    <>
      <NotesIcon warningNotes={parentNotes} infoNotes={CLDR.notes} />
      CLDR:{' '}
      <span style={{ color: getCLDRCoverageColor(cldrCoverage.actualCoverageLevel) }}>
        {cldrCoverage.actualCoverageLevel}
      </span>{' '}
      coverage by {cldrCoverage.countOfCLDRLocales} locale
      {cldrCoverage.countOfCLDRLocales > 1 && 's'}. ICU:{' '}
      {cldrCoverage.inICU ? (
        <CheckCircle2 style={{ color: 'var(--color-text-green)' }} size={'1em'} />
      ) : (
        <XCircle style={{ color: 'var(--color-text-red)' }} size={'1em'} />
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
        <AlertTriangle style={{ color: 'var(--color-text-yellow)' }} size={'1em'} />
      ) : (
        <Info style={{ color: 'var(--color-text-blue)' }} size={'1em'} />
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
