import { ArrowUpLeftIcon, XIcon } from 'lucide-react';
import React from 'react';

import EntityPath from '@widgets/pathnav/EntityPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import getEntityFromID from '@entities/lib/getEntityFromID';
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
          <DrawerClose
            aria-label="Close details"
            className="absolute top-3 right-3"
            render={
              <Button size="icon-sm" variant="ghost">
                <XIcon />
              </Button>
            }
          />
          {ent && <DrawerDescription>{ent.type}</DrawerDescription>}
          <DrawerTitle className="text-xl">
            {ent ? <EntityTitle ent={ent} highlightSearchMatches={false} /> : 'Details'}
          </DrawerTitle>
          {ent?.nameEndonym && <DrawerDescription>{ent.nameEndonym}</DrawerDescription>}
          {ent && (
            <Button
              className="mt-2 self-start"
              variant="outline"
              onClick={() =>
                updatePageParams({ cmpID: ent.ID, entID: undefined, view: View.Details })
              }
            >
              <ArrowUpLeftIcon data-icon="inline-start" />
              Open details page
            </Button>
          )}
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto p-4 pt-3">
          {ent ? (
            <>
              <PathContainer className="mb-2">
                <EntityPath ent={ent} />
              </PathContainer>
              <ContainErrorsAndSuspense>
                <EntityDetailsBody entID={ent.ID} />
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

export default EntityDetailsDrawer;
