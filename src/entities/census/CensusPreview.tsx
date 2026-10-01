import React from 'react';

import PaginationControls from '@features/pagination/PaginationControls';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import usePageParams from '@features/params/usePageParams';

import EntityTitle from '@entities/ui/EntityTitle';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';
import Deemphasized from '@shared/ui/Deemphasized';

import CensusDetails from './CensusDetails';
import { CensusData } from './CensusTypes';

const CensusPreview: React.FC<{ censuses: CensusData[] }> = ({ censuses }) => {
  const { page } = usePageParams();
  return (
    <>
      <div>
        Please check over this data to make sure it makes sense. Check that the metadata makes
        sense. Check the population numbers, percent in territory, language names, language codes.
      </div>
      <div>
        <PaginationControls itemCount={censuses.length} />
      </div>
      <div className="p-4 m-2 border rounded">
        {censuses.length > 0 && page <= censuses.length && censuses[page - 1] ? (
          <LocalParamsProvider overrides={{ page: 1, limit: 20 }}>
            <ContainErrorsAndSuspense>
              <h3>
                <EntityTitle ent={censuses[page - 1]} highlightSearchMatches={false} />
              </h3>
              <CensusDetails census={censuses[page - 1]} />
            </ContainErrorsAndSuspense>
          </LocalParamsProvider>
        ) : (
          <Deemphasized>No censuses from input</Deemphasized>
        )}
      </div>
    </>
  );
};

export default CensusPreview;
