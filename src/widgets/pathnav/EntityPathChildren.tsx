import React from 'react';

import usePageParams from '@features/params/usePageParams';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { EntityData } from '@entities/types/DataTypes';

import { BreadcrumbSeparator } from '@shared/ui/breadcrumb';
import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

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
  const descendantsName = getDescendantsName(ent, children.length);

  return (
    <>
      <BreadcrumbSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost">{children.length + ' ' + descendantsName}</Button>}
        />
        <DropdownMenuContent>
          {children.map((child) => (
            <DropdownMenuItem
              key={child.ID}
              className="cursor-pointer"
              onClick={() => updatePageParams({ entID: child.ID, entType: ent.type })}
            >
              {child.nameDisplay}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default EntityPathChildren;
