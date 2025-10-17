import React from 'react';

import { useDataContext } from '@features/data-loading/DataContext';
import { getScopeFilter } from '@features/filtering/filter';
import { ObjectType } from '@features/page-params/PageParamTypes';
import { getSortFunction } from '@features/sorting/sort';
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
