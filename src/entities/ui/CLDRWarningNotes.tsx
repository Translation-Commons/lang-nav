import { AlertTriangleIcon, InfoIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';
import { ObjectType } from '@features/page-params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

/** accumulates notes about oddities with CLDR coverage */
const CLDRWarningNotes: React.FC<{
  object: ObjectData;
  parentNotes?: React.ReactNode;
}> = ({ object, parentNotes }) => {
  if (object.type !== ObjectType.Language) return null;

  const { CLDR } = object;
  const { coverage, dataProvider } = CLDR;

  if (coverage == null && dataProvider != null) {
    // The CLDR data comes from something else, load those notes too
    return (
      <CLDRWarningNotes
        object={dataProvider}
        parentNotes={[parentNotes, CLDR.notes].filter((n) => n != null)}
      />
    );
  }

  return <NotesIcon warningNotes={parentNotes} infoNotes={CLDR.notes} />;
};

export default CLDRWarningNotes;

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
    <Hoverable hoverContent={formattedNotes} style={{ marginLeft: '0.25em' }}>
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
