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
      <ContainErrorsAndSuspense>
        <FilterPanelProvider>
          <FieldCoverageTable />
        </FilterPanelProvider>
      </ContainErrorsAndSuspense>
    </DocsPageContainer>
  );
};

export default DataCoveragePage;
