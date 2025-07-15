import React from 'react';

import { getScopeFilter } from '../../controls/filter';
import { getSortFunction } from '../../controls/sort';
import { useDataContext } from '../../data/DataContext';
import { ObjectData, TerritoryData, TerritoryScope } from '../../types/DataTypes';
import { ObjectType } from '../../types/PageParamTypes';
import { TreeNodeData } from '../common/TreeList/TreeListNode';
import TreeListPageBody from '../common/TreeList/TreeListPageBody';

export const TerritoryHierarchy: React.FC = () => {
  const { territories } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = getScopeFilter();

  const rootNodes = getTerritoryTreeNodes(
    Object.values(territories).filter(
      (t) => t.parentUNRegion == null || !filterByScope(t.parentUNRegion),
    ),
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
    children: getTerritoryTreeNodes(territory.containsTerritories, sortFunction, filterByScope),
    labelStyle: {
      fontWeight: territory.scope === TerritoryScope.Country ? 'bold' : 'normal',
      fontStyle: territory.scope === TerritoryScope.Dependency ? 'italic' : 'normal',
    },
  };
}
