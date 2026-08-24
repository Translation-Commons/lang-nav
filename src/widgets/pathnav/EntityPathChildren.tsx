import { SlashIcon } from 'lucide-react';
import React from 'react';

import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { EntityData } from '@entities/types/DataTypes';

import { getDescendantsName, getEntityChildren } from './getParentsAndDescendants';

/*
 * Displays the children of an entity in the path navigation.
 * If there are no children, it returns null.
 * If there are children, it displays a selector to navigate to a child ent.
 */
const EntityPathChildren: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  const { updatePageParams } = usePageParams();
  const sortFunction = getSortFunction();
  if (!ent) return null;

  // Get child nodes
  const children = getEntityChildren(ent)
    .filter((c) => c != null)
    .sort(sortFunction);

  // Prepare data
  if (children.length < 1) return null;
  const childIDs = children.map((child) => child.ID);
  const descendantsName = getDescendantsName(ent, children.length);

  return (
    <>
      <SlashIcon size="1em" />
      <Selector<string>
        onChange={(childID) => updatePageParams({ entID: childID, entType: ent.type })}
        selected={children.length + ' ' + descendantsName}
        options={childIDs}
        getOptionLabel={(childID) => {
          const child = children.find((c) => c.ID === childID);
          return child ? child.nameDisplay : childID;
        }}
      />
    </>
  );
};

export default EntityPathChildren;
