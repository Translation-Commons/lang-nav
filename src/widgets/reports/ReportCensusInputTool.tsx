import React, { useEffect, useState } from 'react';

import CensusDetails from '@widgets/details/CensusDetails';

import { useDataContext } from '@features/data/context/useDataContext';
import { parseCensusImport } from '@features/data/load/extra_entities/loadCensusData';
import PaginationControls from '@features/pagination/PaginationControls';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import usePageParams from '@features/params/usePageParams';

import { CensusData } from '@entities/census/CensusTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const ReportCensusInputTool: React.FC = () => {
  const { getTerritory } = useDataContext();
  const [tsv, setTSV] = useState('');
  const [censuses, setCensuses] = useState<CensusData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    try {
      const { censuses } = parseCensusImport(tsv, '');
      censuses.forEach((census) => {
        if (!census.nameDisplay) census.nameDisplay = 'MISSING NAME';
        census.territory = getTerritory(census.isoRegionCode) || undefined;
      });
      setCensuses(censuses);
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
      {errorMessage && <div style={{ color: 'var(--color-red)' }}>{errorMessage}</div>}
      <LocalParamsProvider overrides={{ page: 1, limit: 1 }}>
        <ContainErrorsAndSuspense>
          <CensusPreview censuses={censuses} />
        </ContainErrorsAndSuspense>
      </LocalParamsProvider>
    </div>
  );
};

const CensusPreview: React.FC<{ censuses: CensusData[] }> = ({ censuses }) => {
  const { page } = usePageParams();
  return (
    <>
      <h2>Census Preview</h2>
      <div>
        Please check over this data to make sure it makes sense. Check that the metadata makes
        sense. Check the population numbers, percent in territory, language names, language codes.
      </div>
      <div>
        {censuses.length} census tables found. <PaginationControls itemCount={censuses.length} />
      </div>
      <div
        style={{
          padding: '1em',
          margin: '1em 3em',
          border: '2px solid var(--color-button-primary)',
          borderRadius: '0.5em',
        }}
      >
        {censuses.length > 0 && page <= censuses.length && censuses[page - 1] && (
          <LocalParamsProvider overrides={{ page: 1, limit: 5 }}>
            <ContainErrorsAndSuspense>
              <h2>
                <ObjectTitle object={censuses[page - 1]} highlightSearchMatches={false} />
              </h2>
              <CensusDetails census={censuses[page - 1]} />
            </ContainErrorsAndSuspense>
          </LocalParamsProvider>
        )}
      </div>
    </>
  );
};

export default ReportCensusInputTool;
