import React, { ReactNode, useCallback } from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';


import CensusLanguageCheckRow from './CensusLanguageCheckRow';
import useCensusLanguageCheck from './useCensusLanguageCheck';

export type CensusLanguageNotes = {
  i: number; // index amongst the language section
  lineNumber: number; // offset from the top of the page
  codePath: string; // allowing for /-separated codes
  codePathRec?: string;
  specificCode?: string; // the most specific code (eg. `srp` in `hbs/srp`) which will be used for the language name
  originalName: string;
  name?: string;
  entry?: LanguageData;
  issues: ReactNode[];
};

const CensusLanguageCheck: React.FC<{ fileInput: string }> = ({ fileInput }) => {
  const languageEvaluations = useCensusLanguageCheck(fileInput);

  const copyLanguageCodes = useCallback(() => {
    const codesToCopy = languageEvaluations
      .map((ln) => (ln ? (ln.codePathRec ?? ln.codePath) : ''))
      .join('\n');
    navigator.clipboard.writeText(codesToCopy);
  }, [languageEvaluations]);

  if (!Object.values(languageEvaluations).some((l) => l && l.issues.length > 0)) {
    return <div>No issues found with language codes or names.</div>;
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Line</th>
            <th>Recommended Code(s)</th>
            <th>Original Language Code(s)</th>
            <th>Language Name in Census</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {languageEvaluations.map(
            (l, i) => l && l.issues.length > 0 && <CensusLanguageCheckRow key={i} notes={l} />,
          )}
        </tbody>
      </table>
      <button onClick={copyLanguageCodes}>
        Copy language codes after optimistic correction
      </button>{' '}
    </>
  );
};

export default CensusLanguageCheck;
