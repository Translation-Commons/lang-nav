import React from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const CardList = React.lazy(() => import('@widgets/cardlists/CardList'));
const ViewMap = React.lazy(() => import('./ViewMap'));
const ViewReports = React.lazy(() => import('./ViewReports'));
const ViewFamilyTree = React.lazy(() => import('./ViewFamilyTree'));
const ViewTable = React.lazy(() => import('./ViewTable'));

function DataViews() {
  const { view } = usePageParams();

  return (
    <ContainErrorsAndSuspense>
      <SpecificDataView view={view} />
    </ContainErrorsAndSuspense>
  );
}

function SpecificDataView({ view }: { view: View }) {
  switch (view) {
    case View.CardList:
      return <CardList />;
    case View.Hierarchy:
      return <ViewFamilyTree />;
    case View.Table:
      return <ViewTable />;
    case View.Reports:
      return <ViewReports />;
    case View.Map:
      return <ViewMap />;
  }
}

export default DataViews;
