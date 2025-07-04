import React from 'react';

import { getGranularityFilter } from '../../controls/filter';
import { getSortFunction } from '../../controls/sort';
import { useDataContext } from '../../data/DataContext';
import { ObjectData, TerritoryData, TerritoryType } from '../../types/DataTypes';
import { ObjectType } from '../../types/PageParamTypes';
import { TreeNodeData } from '../common/TreeList/TreeListNode';
import TreeListPageBody from '../common/TreeList/TreeListPageBody';

export const TerritoryHierarchy: React.FC = () => {
  const { territories } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByGranularity = getGranularityFilter();

  const rootNodes = getTerritoryTreeNodes(
    Object.values(territories).filter(
      (t) => t.parentUNRegion == null || !filterByGranularity(t.parentUNRegion),
    ),
    sortFunction,
    filterByGranularity,
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
  filterByGranularity: (a: ObjectData) => boolean,
): TreeNodeData[] {
  return territories
    .sort(sortFunction)
    .filter(filterByGranularity)
    .map((territory) => getTerritoryTreeNode(territory, sortFunction, filterByGranularity));
}

function getTerritoryTreeNode(
  territory: TerritoryData,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterByGranularity: (a: ObjectData) => boolean,
): TreeNodeData {
  return {
    type: ObjectType.Language,
    object: territory,
    children: getTerritoryTreeNodes(
      territory.containsTerritories,
      sortFunction,
      filterByGranularity,
    ),
    labelStyle: {
      fontWeight: territory.territoryType === TerritoryType.Country ? 'bold' : 'normal',
      fontStyle: territory.territoryType === TerritoryType.Dependency ? 'italic' : 'normal',
    },
  };
}
