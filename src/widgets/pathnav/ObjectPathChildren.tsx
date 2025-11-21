import { SlashIcon } from 'lucide-react';
import React from 'react';

import Selector from '@widgets/controls/components/Selector';

import usePageParams from '@features/page-params/usePageParams';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { ObjectData } from '@entities/types/DataTypes';

import { getDescendantsName, getObjectChildren } from './getParentsAndDescendents';

/*
 * Displays the children of an object in the path navigation.
 * If there are no children, it returns null.
 * If there are children, it displays a selector to navigate to a child object.
 */
const ObjectPathChildren: React.FC<{ object?: ObjectData }> = ({ object }) => {
  const { updatePageParams } = usePageParams();
  const sortFunction = getSortFunction();
  if (!object) return null;

  // Get child nodes
  const children = getObjectChildren(object)
    .filter((c) => c != null)
    .sort(sortFunction);

  // Prepare data
  if (children.length < 1) return null;
  const childIDs = children.map((child) => child.ID);
  const descendantsName = getDescendantsName(object, children.length);

  return (
    <>
      <SlashIcon size="1em" />
      <Selector<string>
        onChange={(childID) => updatePageParams({ objectID: childID, objectType: object.type })}
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

export default ObjectPathChildren;
