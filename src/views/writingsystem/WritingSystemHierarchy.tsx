import React from 'react';

import { getScopeFilter } from '../../controls/filter';
import { getSortFunction } from '../../controls/sort';
import { useDataContext } from '../../data/DataContext';
import { ObjectData, WritingSystemData } from '../../types/DataTypes';
import { ObjectType } from '../../types/PageParamTypes';
import { TreeNodeData } from '../common/TreeList/TreeListNode';
import TreeListPageBody from '../common/TreeList/TreeListPageBody';

export const WritingSystemHierarchy: React.FC = () => {
  const { writingSystems } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = getScopeFilter();

  const rootNodes = getWritingSystemTreeNodes(
    Object.values(writingSystems).filter(
      (w) => w.parentWritingSystem == null || !filterByScope(w.parentWritingSystem),
    ),
    sortFunction,
    filterByScope,
  );

  return (
    <TreeListPageBody
      rootNodes={rootNodes}
      description={
        <>
          <strong>Bold writing systems</strong> historically led to other writing systems that are
          still used today. <em>Italicized writing systems</em> have few recorded users (either
          missing data or it is functionally extinct).
        </>
      }
    />
  );
};

export function getWritingSystemTreeNodes(
  writingSystems: WritingSystemData[],
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean = () => true,
): TreeNodeData[] {
  return writingSystems
    .filter(filterFunction)
    .sort(sortFunction)
    .map((writingSystem) => getWritingSystemTreeNode(writingSystem, sortFunction, filterFunction))
    .filter((node) => node != null);
}

function getWritingSystemTreeNode(
  writingSystem: WritingSystemData,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean,
): TreeNodeData {
  return {
    type: ObjectType.WritingSystem,
    object: writingSystem,
    children: getWritingSystemTreeNodes(
      writingSystem.childWritingSystems,
      sortFunction,
      filterFunction,
    ),
    labelStyle: {
      fontWeight: writingSystem.populationOfDescendents > 100 ? 'bold' : 'normal',
      fontStyle: writingSystem.populationUpperBound <= 100 ? 'italic' : 'normal',
    },
  };
}
