import { ArrowLeftIcon, ArrowRightIcon, ArrowUpLeftSquareIcon, XIcon } from 'lucide-react';
import React from 'react';

import usePrevNextEntities from '@features/data/context/usePrevNextEntities';
import { View } from '@features/params/PageParamTypes';
import usePageParamNavigation from '@features/params/usePageParamNavigation';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import { Button } from '@shared/ui/button';
import { DrawerClose } from '@shared/ui/drawer';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';
import PinButton from '@shared/ui/PinButton';

const DrawerHeaderActions: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  const { entType, updatePageParams } = usePageParams();
  const updatePage = usePageParamNavigation({});
  const { prev, next } = usePrevNextEntities({ ent });

  return (
    <div className="absolute top-2 right-3 flex gap-2 ">
      {prev && (
        <Button variant="ghost" onClick={() => updatePageParams({ entID: prev.ID })}>
          <ArrowLeftIcon />
        </Button>
      )}
      {next && (
        <Button variant="ghost" onClick={() => updatePageParams({ entID: next.ID })}>
          <ArrowRightIcon />
        </Button>
      )}
      {ent && (
        <HoverCard>
          <HoverCardTrigger
            delay={10}
            render={
              <Button
                variant="ghost"
                onClick={() => updatePage({ cmpID: ent.ID, entType: ent.type, view: View.Details })}
              >
                <ArrowUpLeftSquareIcon />
              </Button>
            }
          />
          <HoverCardContent className="w-fit">See all details in main view</HoverCardContent>
        </HoverCard>
      )}
      {ent?.type === entType && <PinButton ent={ent} />}
      <DrawerClose
        aria-label="Close details"
        render={
          <Button size="icon" variant="ghost">
            <XIcon />
          </Button>
        }
      />
    </div>
  );
};

export default DrawerHeaderActions;
