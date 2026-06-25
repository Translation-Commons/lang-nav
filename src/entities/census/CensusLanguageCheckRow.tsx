import React from 'react';

import Deemphasized from '@shared/ui/Deemphasized';

import { CensusLanguageNotes } from './CensusLanguageCheck';

const CensusLanguageCheckRow: React.FC<{ notes: CensusLanguageNotes }> = ({ notes }) => {
  if (notes == null || !notes.issues) return null;

  return (
    <tr>
      <td>{notes.lineNumber}</td>
      <td>
        <CodePathRecommendation notes={notes} />
      </td>
      <td>
        {!notes.codePathRec || notes.codePathRec === notes.codePath ? (
          <Deemphasized>{notes.codePath}</Deemphasized>
        ) : (
          notes.codePath
        )}
      </td>
      <td>{notes.name}</td>
      <td>
        {notes.issues.map((issue, index) => (
          <div key={index}>{issue}</div>
        ))}
      </td>
    </tr>
  );
};

function CodePathRecommendation({ notes }: { notes: CensusLanguageNotes }): React.ReactNode {
  if (!notes.codePathRec || notes.codePathRec === notes.codePath)
    return <Deemphasized>{notes.codePath}</Deemphasized>;
  const newParts = notes.codePathRec.split('/');
  const oldParts = notes.codePath.split('/');
  return (
    <>
      {newParts.map((part, i) => {
        const isDifferent = !oldParts.includes(part) && part !== '';
        return (
          <span key={i} style={{ color: isDifferent ? 'var(--color-red)' : 'inherit' }}>
            {part}
            {i < newParts.length - 1 ? '/' : ''}
          </span>
        );
      })}
    </>
  );
}

export default CensusLanguageCheckRow;
