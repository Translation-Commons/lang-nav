import { View } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import ViewCardList from './ViewCardList';
import ViewDetails from './ViewDetails';
import ViewFamilyTree from './ViewFamilyTree';
import ViewReports from './ViewReports';
import ViewTable from './ViewTable';

import './styles.css';

function DataViews() {
  const { view } = usePageParams();

  switch (view) {
    case View.CardList:
      return <ViewCardList />;
    case View.Details:
      return <ViewDetails />;
    case View.Hierarchy:
      return <ViewFamilyTree />;
    case View.Table:
      return <ViewTable />;
    case View.Reports:
      return <ViewReports />;
  }
}

export default DataViews;
