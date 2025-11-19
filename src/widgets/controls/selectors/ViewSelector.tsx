import React from 'react';

import { View } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplayContext';

const ViewSelector: React.FC = () => {
  const { view, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Display"
      getOptionDescription={(option) => <img src={getImageSrc(option)} width={180} />}
      options={Object.values(View)}
      onChange={(view: View) => updatePageParams({ view, objectID: undefined })}
      display={SelectorDisplay.ButtonList}
      getOptionLabel={(view) =>
        [View.Map, View.Reports].includes(view) ? (
          <>
            {view} <em>β</em>
          </>
        ) : (
          view
        )
      }
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
    case View.Map:
      return '/lang-nav/map.png';
    case View.Table:
      return '/lang-nav/table.png';
    case View.Reports:
      return '/lang-nav/reports.png';
  }
}

export default ViewSelector;
