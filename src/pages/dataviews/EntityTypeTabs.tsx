import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

import ObjectTypeDescription from '@strings/ObjectTypeDescription';

const EntityTypeTabs: React.FC = () => {
  const { objectType, updatePageParams } = usePageParams();

  return (
    <Tabs
      className="mb-2"
      value={objectType}
      onValueChange={(value) => updatePageParams({ objectType: value as ObjectType })}
    >
      <div className="w-full max-w-full overflow-x-auto">
        <TabsList>
          {Object.values(ObjectType).map((entityType) => (
            <TabsTrigger key={entityType} value={entityType}>
              <HoverCard>
                <HoverCardTrigger render={<span className="inline-flex items-center" />}>
                  {entityType}
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="mb-2">Click here to change the kind of entity viewed.</div>
                  <ObjectTypeDescription objectType={entityType} />
                </HoverCardContent>
              </HoverCard>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
};

export default EntityTypeTabs;
