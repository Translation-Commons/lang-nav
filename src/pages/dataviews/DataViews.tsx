import CardList from '@widgets/cardlists/CardList';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import ViewFamilyTree from './ViewFamilyTree';
import ViewMap from './ViewMap';
import ViewReports from './ViewReports';
import ViewTable from './ViewTable';

import './styles.css';

function DataViews() {
  const { view } = usePageParams();

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
