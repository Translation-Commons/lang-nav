import React from 'react';

import CensusDetails from '@widgets/details/CensusDetails';

import PaginationControls from '@features/pagination/PaginationControls';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import usePageParams from '@features/params/usePageParams';

import ObjectTitle from '@entities/ui/ObjectTitle';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

import { CensusData } from './CensusTypes';

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
      <div className="p-4 my-4 mx-[3em] border-2 border-primary rounded-[0.5em]">
        {censuses.length > 0 && page <= censuses.length && censuses[page - 1] && (
          <LocalParamsProvider overrides={{ page: 1, limit: 20 }}>
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

export default CensusPreview;
