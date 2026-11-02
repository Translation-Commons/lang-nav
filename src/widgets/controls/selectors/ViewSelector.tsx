import React from 'react';

import { getViewIcon, getViewLabel } from '@widgets/controls/selectors/ViewDisplay';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import EnumDropdown from '@shared/ui/EnumDropdown';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

const ViewSelector: React.FC = () => {
  const { view: currentView, updatePageParams } = usePageParams();

  return (
    <div>
      <Tabs
        className="hidden md:flex"
        value={currentView}
        onValueChange={(view) => updatePageParams({ view })}
      >
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
      <EnumDropdown
        buttonClassname="md:hidden min-w-10 max-w-24 truncate"
        value={currentView}
        onChange={(view) => updatePageParams({ view })}
        options={Object.values(View)}
        getLabel={(v) => (
          <div className="flex items-center gap-1 text-nowrap">
            {getViewIcon(v)}
            {getViewLabel(v)}
          </div>
        )}
      />
    </div>
  );
};

export default ViewSelector;
