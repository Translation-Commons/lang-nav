import React, { useEffect, useState } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { parseCensusImport } from '@features/data/load/extra_entities/loadCensusData';
import LocalParamsProvider from '@features/params/LocalParamsProvider';

import CensusLanguageCheck from '@entities/census/CensusLanguageCheck';
import CensusPreview from '@entities/census/CensusPreview';
import { CensusData } from '@entities/census/CensusTypes';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';
import { countOccurrences } from '@shared/lib/setUtils';

const ReportCensusInputTool: React.FC = () => {
  const { getTerritory } = useDataContext();
  const [tsv, setTSV] = useState('');
  const [censuses, setCensuses] = useState<CensusData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  useEffect(() => {
    try {
      const { censuses, warnings } = parseCensusImport(tsv, '');
      censuses.forEach((census) => {
        if (!census.nameDisplay) census.nameDisplay = 'MISSING NAME';
        census.territory = getTerritory(census.isoRegionCode) || undefined;
      });
      setCensuses(censuses);

      // Format warnings
      const warningsCounted = Object.entries(countOccurrences(warnings)).map(([warning, count]) =>
        count == 1 ? warning : `${warning} (${count})`,
      );
      setWarnings(warningsCounted);
      setErrorMessage(null);
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  }, [tsv, getTerritory]);

  return (
    <div>
      <h2>TSV file</h2>
      <div>
        Copy-paste work-in-progress TSV files to load the data and see if it is correct. You can
        edit changes inline to test them out. Changes update after clicking away.
      </div>
      <textarea
        onChange={() => {}}
        onBlur={(e) => setTSV(e.target.value)}
        style={{ width: '100%', minHeight: '10em', marginTop: '1em' }}
      />
      <h3>Analysis</h3>
      {errorMessage && <div style={{ color: 'var(--color-red)' }}>{errorMessage}</div>}
      <h4>Metadata</h4>
      {warnings
        ? warnings.map((warning, index) => (
            <div key={index} style={{ color: 'var(--color-red)' }}>
              {warning}
            </div>
          ))
        : 'No issues found.'}
      <h4>Language Codes & Language Names</h4>
      <CensusLanguageCheck fileInput={tsv} />
      <LocalParamsProvider overrides={{ page: 1, limit: 1 }}>
        <ContainErrorsAndSuspense>
          <CensusPreview censuses={censuses} />
        </ContainErrorsAndSuspense>
      </LocalParamsProvider>
    </div>
  );
};

export default ReportCensusInputTool;
