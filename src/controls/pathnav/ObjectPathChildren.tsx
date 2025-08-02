import { SlashIcon } from 'lucide-react';
import React from 'react';

import { ObjectData } from '../../types/DataTypes';
import Selector, { OptionsDisplay } from '../components/Selector';
import { usePageParams } from '../PageParamsContext';
import { getSortFunction } from '../sort';

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
        optionsDisplay={OptionsDisplay.InlineDropdown}
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
