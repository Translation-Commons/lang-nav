import React from 'react';

import { useMediaQuery } from '../../generic/useMediaQuery';
import { View } from '../../types/PageParamTypes';
import Selector from '../components/Selector';
import SingleChoiceOptions from '../components/SingleChoiceOptions';
import { usePageParams } from '../PageParamsContext';

const ViewSelector: React.FC = () => {
  const { view, updatePageParams } = usePageParams();
  const isCompact = useMediaQuery('(max-width: 1450px)');

  return (
    <Selector selectorLabel="View:" appearance="tabs">
      <SingleChoiceOptions<View>
        getOptionDescription={(option) => <img src={getImageSrc(option)} width={180} />}
        mode={isCompact ? 'dropdown' : 'flat'}
        options={Object.values(View)}
        onChange={(view: View) => updatePageParams({ view, objectID: undefined })}
        selected={view}
      />
    </Selector>
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
    case View.About:
      return '/lang-nav/about.png';
  }
}

export default ViewSelector;
