import React from 'react';

import { getScopeFilter } from '../../controls/filter';
import { getSortFunction } from '../../controls/sort';
import { useDataContext } from '../../data/DataContext';
import { CensusData } from '../../types/CensusTypes';
import { ObjectData, TerritoryData } from '../../types/DataTypes';
import { ObjectType } from '../../types/PageParamTypes';
import { TreeNodeData } from '../common/TreeList/TreeListNode';
import TreeListPageBody from '../common/TreeList/TreeListPageBody';

export const CensusHierarchy: React.FC = () => {
  const { territories } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = getScopeFilter();

  const rootNodes = getCensusTreeNodes(Object.values(territories), sortFunction, filterByScope);

  return (
    <TreeListPageBody
      rootNodes={rootNodes}
      description={
        <>
          This view shows censuses and census tables, organized by the country they were collected
          for.
        </>
      }
    />
  );
};

export function getCensusTreeNodes(
  territories: TerritoryData[],
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean = () => true,
): TreeNodeData[] {
  return territories
    .filter(filterFunction ?? (() => true))
    .filter((territory) => territory.censuses.length > 0)
    .sort(sortFunction)
    .map((t) => getTerritoryTreeNode(t, sortFunction, filterFunction));
}

function getTerritoryTreeNode(
  territory: TerritoryData,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean,
): TreeNodeData {
  return {
    type: ObjectType.Census,
    object: territory,
    children: getCensusNodesForTerritory(territory, sortFunction, filterFunction),
  };
}

function getCensusNodesForTerritory(
  territory: TerritoryData,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean,
): TreeNodeData[] {
  return territory.censuses
    .filter(filterFunction)
    .sort(sortFunction)
    .map((census) => getCensusNode(census));
}

function getCensusNode(census: CensusData): TreeNodeData {
  return {
    type: ObjectType.Census,
    object: census,
    labelStyle: { fontWeight: 'bold' },
    children: [], // Languages could be listed here -- but if there are many censuses loaded this could add up to a lot of data
  };
}
