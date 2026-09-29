import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { EntityData, EntityType } from '@entities/types/EntityTypes';

import type { OrganizationData } from './OrganizationTypes';

export const OrganizationHierarchy: React.FC = () => {
  const { organizations } = useDataContext();
  const sortFunction = getSortFunction();

  const rootNodes = getOrganizationTreeNodes(
    organizations.filter((org) => org.parent == null),
    sortFunction,
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

function getOrganizationTreeNodes(
  orgs: OrganizationData[],
  sortFunction: (a: EntityData, b: EntityData) => number,
): TreeNodeData[] {
  return orgs
    .slice()
    .sort(sortFunction)
    .map((org) => getOrganizationTreeNode(org, sortFunction));
}

function getOrganizationTreeNode(
  org: OrganizationData,
  sortFunction: (a: EntityData, b: EntityData) => number,
): TreeNodeData {
  return {
    type: EntityType.Org,
    ent: org,
    children: org.children ? getOrganizationTreeNodes(org.children, sortFunction) : [],
  };
}
