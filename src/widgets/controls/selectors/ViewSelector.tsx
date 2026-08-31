import { ChartColumnBigIcon, Grid2x2Icon, ListTreeIcon, MapIcon, Table2Icon } from 'lucide-react';
import React from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';
import { ButtonGroup } from '@shared/ui/button-group';

const ViewSelector: React.FC = () => {
  const { view: currentView, updatePageParams } = usePageParams();

  return (
    <ButtonGroup aria-label="Button group">
      {Object.values(View).map((view) => (
        <Button
          key={view}
          variant={currentView === view ? 'default' : 'secondary'}
          className="flex h-fit! cursor-pointer flex-col gap-0"
          onClick={() => updatePageParams({ view })}
        >
          <div className="pt-1">{getViewIcon(view)}</div>
          {view}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export function getViewIcon(view: View): React.ReactNode {
  switch (view) {
    case View.CardList:
      return <Grid2x2Icon />;
    case View.Hierarchy:
      return <ListTreeIcon />;
    case View.Map:
      return <MapIcon />;
    case View.Table:
      return <Table2Icon />;
    case View.Reports:
      return <ChartColumnBigIcon />;
  }
}

export default ViewSelector;
