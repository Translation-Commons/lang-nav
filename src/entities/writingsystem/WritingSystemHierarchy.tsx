import React, { useMemo } from 'react';

import { ObjectType } from '@widgets/PageParamTypes';

import { useDataContext } from '@features/data-loading/DataContext';
import { getSortFunction } from '@features/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { ObjectData, WritingSystemData } from '@entities/types/DataTypes';

export const WritingSystemHierarchy: React.FC = () => {
  const { writingSystems } = useDataContext();
  const sortFunction = getSortFunction();

  const rootNodes = useMemo(
    () =>
      getWritingSystemTreeNodes(
        writingSystems.filter((w) => w.parentWritingSystem == null),
        sortFunction,
      ),
    [writingSystems, sortFunction],
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
    children: writingSystem.childWritingSystems
      ? getWritingSystemTreeNodes(writingSystem.childWritingSystems, sortFunction, filterFunction)
      : [],
    labelStyle: {
      fontWeight: (writingSystem?.populationOfDescendents ?? 0) > 100 ? 'bold' : 'normal',
      fontStyle: (writingSystem?.populationUpperBound ?? 0) <= 100 ? 'italic' : 'normal',
    },
  };
}
