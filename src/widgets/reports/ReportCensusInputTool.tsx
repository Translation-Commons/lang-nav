import React, { useEffect, useState } from 'react';

import CensusLanguageCheck from '@widgets/decoder/CensusLanguageCheck';

import { useDataContext } from '@features/data/context/useDataContext';
import { parseCensusImport } from '@features/data/load/extra_entities/loadCensusData';
import LocalParamsProvider from '@features/params/LocalParamsProvider';

import CensusPreview from '@entities/census/CensusPreview';
import { CensusData } from '@entities/census/CensusTypes';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';
import { countOccurrences } from '@shared/lib/setUtils';

const ReportCensusInputTool: React.FC = () => {
  const { getTerritory, getOrganization } = useDataContext();
  const [tsv, setTSV] = useState(''); // Debounced input from the user, used for analysis
  const [input, setInput] = useState(''); // The raw input from the user
  const [censuses, setCensuses] = useState<CensusData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Synchronize the raw input with the debounced TSV input
  useEffect(() => {
    const handler = setTimeout(() => setTSV(input), 1000);
    return () => clearTimeout(handler);
  }, [input]);

  // Update the analysis
  useEffect(() => {
    try {
      const { censuses, warnings } = parseCensusImport(tsv, '');
      censuses.forEach((census) => {
        if (!census.nameDisplay) census.nameDisplay = 'MISSING NAME';
        census.territory = getTerritory(census.isoRegionCode) || undefined;

        // Add collector entities -- note if they are new they will have to be added to organizations.tsv
        const collectorCode = census.collectorNameShort ?? census.collectorName;
        if (collectorCode) {
          census.collector = getOrganization(collectorCode);
          if (!census.collector) {
            warnings.push(
              `Collector "${collectorCode}" not found in organizations data. Add it to organizations.tsv to link them.`,
            );
          }
        }
        if (census.presentedBy) {
          census.presenter = getOrganization(census.presentedBy);
          if (!census.presenter) {
            warnings.push(
              `Presenter "${census.presentedBy}" not found in organizations data. Add it to organizations.tsv to link them.`,
            );
          }
        }
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
  }, [tsv, getTerritory, getOrganization]);

  return (
    <div>
      <h3>TSV File</h3>
      <div>
        Copy-paste work-in-progress TSV files to load the data and see if it is correct. You can
        edit changes inline to test them out.
      </div>
      <textarea
        className="border border-gray-300 rounded p-2"
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', minHeight: '10em', marginTop: '1em' }}
      />
      <h3>Analysis</h3>
      {errorMessage && <div style={{ color: 'var(--color-red)' }}>{errorMessage}</div>}
      {censuses.length > 0 && <div className="font-bold">Metadata</div>}
      {censuses.length > 0 &&
        (warnings.length > 0
          ? warnings.map((warning, index) => (
              <div key={index} style={{ color: 'var(--color-red)' }}>
                {warning}
              </div>
            ))
          : 'No issues found.')}
      <div className="font-bold">Language Codes & Language Names</div>
      <ContainErrorsAndSuspense>
        <CensusLanguageCheck fileInput={tsv} />
      </ContainErrorsAndSuspense>
      <LocalParamsProvider overrides={{ page: 1, limit: 1 }}>
        <ContainErrorsAndSuspense>
          <CensusPreview censuses={censuses} />
        </ContainErrorsAndSuspense>
      </LocalParamsProvider>
    </div>
  );
};

export default ReportCensusInputTool;
