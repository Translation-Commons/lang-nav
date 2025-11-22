import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';
import { getScopeFilter } from '@features/transforms/filtering/filter';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { ObjectData, TerritoryData, TerritoryScope } from '@entities/types/DataTypes';

export const TerritoryHierarchy: React.FC = () => {
  const { territories } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = getScopeFilter();

  const rootNodes = getTerritoryTreeNodes(
    territories.filter((t) => t.parentUNRegion == null || !filterByScope(t.parentUNRegion)),
    sortFunction,
    filterByScope,
  );

  return (
    <TreeListPageBody
      rootNodes={rootNodes}
      description={
        <>
          <strong>Bold territories</strong> are countries. <em>Italicized countries</em> are
          dependencies.
        </>
      }
    />
  );
};

export function getTerritoryTreeNodes(
  territories: TerritoryData[],
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterByScope: (a: ObjectData) => boolean,
): TreeNodeData[] {
  return territories
    .sort(sortFunction)
    .filter(filterByScope)
    .map((territory) => getTerritoryTreeNode(territory, sortFunction, filterByScope));
}

function getTerritoryTreeNode(
  territory: TerritoryData,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterByScope: (a: ObjectData) => boolean,
): TreeNodeData {
  return {
    type: ObjectType.Language,
    object: territory,
    children: territory.containsTerritories
      ? getTerritoryTreeNodes(territory.containsTerritories, sortFunction, filterByScope)
      : [],
    labelStyle: {
      fontWeight: territory.scope === TerritoryScope.Country ? 'bold' : 'normal',
      fontStyle: territory.scope === TerritoryScope.Dependency ? 'italic' : 'normal',
    },
  };
}
