import React from 'react';

import { View } from '../../types/PageParamTypes';
import Selector from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const ViewSelector: React.FC = () => {
  const { view, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="View"
      getOptionDescription={(option) => <img src={getImageSrc(option)} width={180} />}
      options={Object.values(View)}
      onChange={(view: View) => updatePageParams({ view, objectID: undefined })}
      selected={view}
    />
  );
};

function getImageSrc(view: View): string {
  switch (view) {
    case View.CardList:
      return '/lang-nav/cardlist.png';
    case View.Details:
      return '/lang-nav/details.png';
    case View.Hierarchy:
      return '/lang-nav/hierarchy.png';
    case View.Table:
      return '/lang-nav/table.png';
    case View.Reports:
      return '/lang-nav/reports.png';
  }
}

export default ViewSelector;
