import { ChartColumnBigIcon, Grid2x2Icon, ListTreeIcon, MapIcon, Table2Icon } from 'lucide-react';
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
      selectorStyle={{ gap: '0.25rem' }}
    />
  );
};

function getViewLabel(view: View): React.ReactNode {
  const isBeta = [View.Map, View.Reports].includes(view);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <span style={{ display: 'flex', gap: '0.125rem' }}>
        {view} {isBeta && <em>β</em>}
      </span>
      <img src={getImageSrc(view)} width={180} />
    </div>
  );
}

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

function getViewIcon(view: View): React.ReactNode {
  switch (view) {
    case View.CardList:
      return <Grid2x2Icon size="1.2em" />;
    case View.Hierarchy:
      return <ListTreeIcon size="1.2em" />;
    case View.Map:
      return <MapIcon size="1.2em" />;
    case View.Table:
      return <Table2Icon size="1.2em" />;
    case View.Reports:
      return <ChartColumnBigIcon size="1.2em" />;
  }
}

export default ViewSelector;
