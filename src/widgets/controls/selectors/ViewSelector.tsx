import React from 'react';

import { View } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

const ViewSelector: React.FC = () => {
  const { view, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Display"
      getOptionDescription={(option) => <img src={getImageSrc(option)} width={180} />}
      options={Object.values(View)}
      onChange={(view: View) => updatePageParams({ view })}
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
