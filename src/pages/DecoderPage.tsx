import React from 'react';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const FilterPanelProvider = React.lazy(() => import('@widgets/controls/FilterPanelProvider'));
const DecoderPageBody = React.lazy(() => import('@widgets/decoder/DecoderPageBody'));
const EntityDetailsDrawer = React.lazy(() => import('@widgets/details/ui/EntityDetailsDrawer'));

const DecoderPage: React.FC = () => {
  /* Many data components have more lines of code so they are loaded lazily */
  return (
    <ContainErrorsAndSuspense>
      <FilterPanelProvider>
        <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
          <DecoderPageBody />
          <EntityDetailsDrawer />
        </div>
      </FilterPanelProvider>
    </ContainErrorsAndSuspense>
  );
};

export default DecoderPage;
