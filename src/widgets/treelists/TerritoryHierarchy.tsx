import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';
import { useScopeFilter } from '@features/transforms/filtering/filter';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';

export const TerritoryHierarchy: React.FC = () => {
  const { territories } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = useScopeFilter();

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
  sortFunction: (a: EntityData, b: EntityData) => number,
  filterByScope: (a: EntityData) => boolean,
): TreeNodeData[] {
  return territories
    .slice()
    .sort(sortFunction)
    .filter(filterByScope)
    .map((territory) => getTerritoryTreeNode(territory, sortFunction, filterByScope));
}

function getTerritoryTreeNode(
  territory: TerritoryData,
  sortFunction: (a: EntityData, b: EntityData) => number,
  filterByScope: (a: EntityData) => boolean,
): TreeNodeData {
  return {
    type: EntityType.Language,
    ent: territory,
    children: territory.containsTerritories
      ? getTerritoryTreeNodes(territory.containsTerritories, sortFunction, filterByScope)
      : [],
    labelStyle: {
      fontWeight: territory.scope === TerritoryScope.Country ? 'bold' : 'normal',
      fontStyle: territory.scope === TerritoryScope.Dependency ? 'italic' : 'normal',
    },
  };
}
