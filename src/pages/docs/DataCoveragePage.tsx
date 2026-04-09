import React, { Suspense } from 'react';

import FilterPanelProvider from '@widgets/controls/FilterPanelProvider';
import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import Loading from '@widgets/Loading';

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
      <Suspense fallback={<Loading />}>
        <FilterPanelProvider>
          <FieldCoverageTable />
        </FilterPanelProvider>
      </Suspense>
    </DocsPageContainer>
  );
};

export default DataCoveragePage;
