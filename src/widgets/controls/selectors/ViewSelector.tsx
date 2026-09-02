import {
  ChartColumnBigIcon,
  FileIcon,
  Grid2x2Icon,
  ListTreeIcon,
  MapIcon,
  Table2Icon,
} from 'lucide-react';
import React from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

const ViewSelector: React.FC = () => {
  const { view: currentView, updatePageParams } = usePageParams();

  return (
    <Tabs value={currentView} onValueChange={(view) => updatePageParams({ view })}>
      <TabsList>
        {Object.values(View).map((v) => (
          <HoverCard key={v}>
            <HoverCardTrigger
              delay={10}
              closeDelay={100}
              render={
                <TabsTrigger value={v} className="cursor-pointer">
                  {getViewIcon(v)}
                </TabsTrigger>
              }
            />
            {/* <TabsTrigger value={v} className="cursor-pointer">
                {getViewIcon(v)}
              </TabsTrigger>
            </HoverCardTrigger> */}
            <HoverCardContent className="w-fit" side="bottom" align="center">
              {getViewLabel(v)}
            </HoverCardContent>
          </HoverCard>
        ))}
      </TabsList>
    </Tabs>
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
    case View.Details:
      return <FileIcon />;
    case View.Table:
      return <Table2Icon />;
    case View.Reports:
      return <ChartColumnBigIcon />;
  }
}

export function getViewLabel(view: View): string {
  switch (view) {
    case View.CardList:
      return 'Card List';
    case View.Hierarchy:
      return 'Hierarchy';
    case View.Map:
      return 'Map';
    case View.Details:
      return 'Single-Item Details';
    case View.Table:
      return 'Table';
    case View.Reports:
      return 'Reports';
  }
}

export default ViewSelector;
