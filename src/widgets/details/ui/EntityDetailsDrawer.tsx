import React from 'react';

import EntityPath from '@widgets/pathnav/EntityPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import getEntityFromID from '@entities/lib/getEntityFromID';
import { EntityData } from '@entities/types/DataTypes';
import EntityTitle from '@entities/ui/EntityTitle';
import VariantDrawer from '@entities/variant/VariantDrawer';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@shared/ui/drawer';

import DrawerHeaderActions from './DrawerHeaderActions';

const LanguageDrawerContents = React.lazy(
  () => import('@entities/language/LanguageDrawerContents'),
);
const TerritoryDrawerContents = React.lazy(
  () => import('@entities/territory/TerritoryDrawerContents'),
);
const LocaleDrawerContents = React.lazy(() => import('@entities/locale/LocaleDrawerContents'));
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
                <EntityPath
                  ent={ent}
                  showChildren={
                    ![EntityType.Language, EntityType.Territory, EntityType.Locale].includes(
                      ent.type,
                    )
                  }
                />
              </PathContainer>
              <ContainErrorsAndSuspense>
                <DrawerBodyContents ent={ent} />
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

const DrawerBodyContents: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (!ent) return null;

  switch (ent.type) {
    case EntityType.Language:
      return <LanguageDrawerContents lang={ent} />;
    case EntityType.Locale:
      return <LocaleDrawerContents locale={ent} />;
    case EntityType.Territory:
      return <TerritoryDrawerContents territory={ent} />;
    case EntityType.Variant:
      return <VariantDrawer variant={ent} />;
    default:
      return <EntityDetailsBody entID={ent.ID} />;
  }
};

export default EntityDetailsDrawer;
