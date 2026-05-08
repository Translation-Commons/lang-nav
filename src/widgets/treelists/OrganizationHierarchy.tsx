import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';
import { getScopeFilter } from '@features/transforms/filtering/filter';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { OrganizationData } from '@entities/org/OrganizationTypes';
import { ObjectData } from '@entities/types/DataTypes';

export const OrganizationHierarchy: React.FC = () => {
  const { organizations } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = getScopeFilter();

  const rootNodes = getOrganizationTreeNodes(
    organizations.filter((org) => org.parent == null),
    sortFunction,
    filterByScope,
  );

  return (
    <TreeListPageBody
      rootNodes={rootNodes}
      description={
        <>
          This is still a work in progress -- we only have data for a handful of organizations right
          now.
        </>
      }
    />
  );
};

export function getOrganizationTreeNodes(
  orgs: OrganizationData[],
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterByScope: (a: ObjectData) => boolean,
): TreeNodeData[] {
  return orgs
    .slice()
    .sort(sortFunction)
    .filter(filterByScope)
    .map((org) => getOrganizationTreeNode(org, sortFunction, filterByScope));
}

function getOrganizationTreeNode(
  org: OrganizationData,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterByScope: (a: ObjectData) => boolean,
): TreeNodeData {
  return {
    type: ObjectType.Org,
    object: org,
    children: org.children
      ? getOrganizationTreeNodes(org.children, sortFunction, filterByScope)
      : [],
  };
}
