import React, { ReactNode, useCallback } from 'react';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

export type TabOption = {
  description?: ReactNode;
  label: string;
  urlParams: Partial<PageParams>;
};

type Props = {
  label?: ReactNode;
  options: TabOption[];
};

const NavTabs: React.FC<Props> = ({ label, options }) => {
  const params = usePageParams();
  const { updatePageParams } = params;
  const getIsActive = useCallback(
    (option: TabOption) =>
      Object.entries(option.urlParams).every(
        ([key, value]) => params[key as keyof PageParams] === value,
      ),
    [params],
  );

  const activeOption = options.find(getIsActive);

  return (
    <div className="mb-2 flex w-full items-center">
      {label && <div className="px-3 py-1 font-medium">{label}</div>}
      <Tabs
        value={activeOption?.label}
        onValueChange={(value) => {
          const option = options.find((opt) => opt.label === value);
          if (option) updatePageParams(option.urlParams);
        }}
      >
        <TabsList variant="line">
          {options.map((option) => (
            <TabsTrigger key={option.label} value={option.label}>
              {option.description ? (
                <HoverCard>
                  <HoverCardTrigger render={<span className="inline-flex items-center" />}>
                    {option.label}
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">{option.description}</HoverCardContent>
                </HoverCard>
              ) : (
                option.label
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default NavTabs;
