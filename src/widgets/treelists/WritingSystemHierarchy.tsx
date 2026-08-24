import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { EntityData } from '@entities/types/DataTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

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
  sortFunction: (a: EntityData, b: EntityData) => number,
  filterFunction: (a: EntityData) => boolean = () => true,
): TreeNodeData[] {
  return writingSystems
    .filter(filterFunction)
    .sort(sortFunction)
    .map((writingSystem) => getWritingSystemTreeNode(writingSystem, sortFunction, filterFunction))
    .filter((node) => node != null);
}

function getWritingSystemTreeNode(
  writingSystem: WritingSystemData,
  sortFunction: (a: EntityData, b: EntityData) => number,
  filterFunction: (a: EntityData) => boolean,
): TreeNodeData {
  return {
    type: EntityType.WritingSystem,
    ent: writingSystem,
    children: writingSystem.childWritingSystems
      ? getWritingSystemTreeNodes(writingSystem.childWritingSystems, sortFunction, filterFunction)
      : [],
    labelStyle: {
      fontWeight: (writingSystem?.populationOfDescendants ?? 0) > 100 ? 'bold' : 'normal',
      fontStyle: (writingSystem?.populationUpperBound ?? 0) <= 100 ? 'italic' : 'normal',
    },
  };
}
