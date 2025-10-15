import { ObjectData } from '@entities/types/DataTypes';
import { getSortFunction } from '@features/sorting/sort';
import Selector from '@widgets/controls/components/Selector';
import { SelectorDisplay } from '@widgets/controls/components/SelectorDisplay';
import { usePageParams } from '@widgets/PageParamsProvider';
import { SlashIcon } from 'lucide-react';
import React from 'react';

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
        display={SelectorDisplay.InlineDropdown}
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
