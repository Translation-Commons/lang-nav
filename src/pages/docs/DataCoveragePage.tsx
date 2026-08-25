import React from 'react';

import FilterPanelProvider from '@widgets/controls/FilterPanelProvider';
import DocsPageContainer from '@widgets/docs/DocsPageContainer';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const FieldCoverageTable = React.lazy(
  () => import('@features/transforms/fields/FieldCoverageTable'),
);
const DataCoveragePage: React.FC = () => {
  return (
    <DocsPageContainer title="Data Coverage">
      <p>
        This table shows the coverage of different fields across all entities in LangNav. This shows
        both the capabilities for different fields as well as potential gaps in user experience or
        data.
      </p>
      {/*
        The prose stays in the page's 800px column; only the table breaks out of it. The negative
        margin widens this block to 1400px and, being symmetric, keeps it centered. It only applies
        from 2xl up, where the viewport can actually fit 1400px -- below that the table stays in the
        column and scrolls horizontally instead.
      */}
      <div className="overflow-x-auto 2xl:-mx-[300px]">
        <div className="mx-auto w-fit">
          <ContainErrorsAndSuspense>
            <FilterPanelProvider>
              <FieldCoverageTable />
            </FilterPanelProvider>
          </ContainErrorsAndSuspense>
        </div>
      </div>
    </DocsPageContainer>
  );
};

export default DataCoveragePage;
