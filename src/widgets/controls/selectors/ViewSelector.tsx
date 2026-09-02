import React from 'react';

import { getViewIcon, getViewLabel } from '@widgets/controls/selectors/ViewDisplay';

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
            <HoverCardContent className="w-fit" side="bottom" align="center">
              {getViewLabel(v)}
            </HoverCardContent>
          </HoverCard>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default ViewSelector;
