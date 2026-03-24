import React, { Suspense } from 'react';

import FilterPanelProvider from '@widgets/controls/FilterPanelProvider';
import { PageContainer } from '@widgets/DocsComponents';
import Loading from '@widgets/Loading';

const FieldCoverageTable = React.lazy(
  () => import('@features/transforms/fields/FieldCoverageTable'),
);
const DataCoveragePage: React.FC = () => {
  return (
    <PageContainer title="Data Coverage">
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
    </PageContainer>
  );
};

export default DataCoveragePage;
