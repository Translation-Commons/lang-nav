import { ChartColumnBigIcon, GitBranchIcon, Grid2x2Icon, MapIcon, Table2Icon } from 'lucide-react';
import React from 'react';

import { View } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

const ViewSelector: React.FC = () => {
  const { view, updatePageParams } = usePageParams();

  return (
    <Selector
      options={Object.values(View)}
      selected={view}
      onChange={(nextView: View) => updatePageParams({ view: nextView })}
      getOptionLabel={(option) => getViewIcon(option)}
      getOptionDescription={(option) => getViewLabel(option)}
      display={SelectorDisplay.ButtonGroup}
      optionStyle={{
        width: 'fit-content',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
      }}
      selectorStyle={{ gap: '0.35rem' }}
    />
  );
};

function getViewLabel(view: View): React.ReactNode {
  return [View.Map, View.Reports].includes(view) ? (
    <>
      {view} <em>β</em>
    </>
  ) : (
    view
  );
}

function getViewIcon(view: View): React.ReactNode {
  switch (view) {
    case View.CardList:
      return <Grid2x2Icon size={18} />;
    case View.Hierarchy:
      return <GitBranchIcon size={18} />;
    case View.Map:
      return <MapIcon size={18} />;
    case View.Table:
      return <Table2Icon size={18} />;
    case View.Reports:
      return <ChartColumnBigIcon size={18} />;
  }
}

export default ViewSelector;
