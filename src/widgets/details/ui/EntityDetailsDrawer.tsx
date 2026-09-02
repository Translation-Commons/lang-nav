import { ArrowLeftIcon, ArrowRightIcon, ArrowUpLeftSquareIcon, XIcon } from 'lucide-react';
import React from 'react';

import EntityPath from '@widgets/pathnav/EntityPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import usePrevNextEntities from '@features/data/context/usePrevNextEntities';
import { EntityType, View } from '@features/params/PageParamTypes';
import usePageParamNavigation from '@features/params/usePageParamNavigation';
import usePageParams from '@features/params/usePageParams';

import getEntityFromID from '@entities/lib/getEntityFromID';
import { EntityData } from '@entities/types/DataTypes';
import EntityTitle from '@entities/ui/EntityTitle';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';
import { Button } from '@shared/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@shared/ui/drawer';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';
import PinButton from '@shared/ui/PinButton';

const LanguageDrawerContents = React.lazy(
  () => import('@entities/language/LanguageDrawerContents'),
);
const EntityDetailsBody = React.lazy(() => import('../EntityDetailsBody'));

const EntityDetailsDrawer: React.FC = () => {
  const { entID, entType, updatePageParams } = usePageParams();
  const ent = getEntityFromID(entID);

  return (
    <Drawer
      modal={false}
      open={entID != null}
      swipeDirection="right"
      onOpenChange={(open) => {
        if (!open) updatePageParams({ entID: undefined });
      }}
    >
      <DrawerContent className="sm:[--drawer-content-width:32rem]">
        <DrawerHeader className="relative pr-12">
          <DrawerHeaderContents ent={ent} />
          <DrawerHeaderActions ent={ent} />
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto p-4 pt-3">
          {ent ? (
            <>
              <PathContainer className="mb-2">
                <EntityPath ent={ent} showChildren={ent.type !== EntityType.Language} />
              </PathContainer>
              <ContainErrorsAndSuspense>
                {ent.type === EntityType.Language ? (
                  <LanguageDrawerContents lang={ent} />
                ) : (
                  <EntityDetailsBody entID={ent.ID} />
                )}
              </ContainErrorsAndSuspense>
            </>
          ) : (
            <>Select a {entType.toLowerCase()} to see more information.</>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

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

const DrawerHeaderContents: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (!ent) return <DrawerTitle className="text-xl">Details</DrawerTitle>;

  return (
    <>
      {ent && <DrawerDescription>{ent.type}</DrawerDescription>}
      <DrawerTitle className="text-2xl justify-between flex items-center gap-2">
        {ent ? <EntityTitle ent={ent} highlightSearchMatches={false} /> : 'Details'}
      </DrawerTitle>
      {ent.nameEndonym && ent.nameEndonym !== ent.nameDisplay && (
        <DrawerDescription>{ent.nameEndonym}</DrawerDescription>
      )}
    </>
  );
};

export default EntityDetailsDrawer;
