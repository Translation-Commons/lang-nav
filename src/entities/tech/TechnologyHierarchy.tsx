import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { OrganizationData } from '@entities/org/OrganizationTypes';
import { EntityData, EntityType } from '@entities/types/EntityTypes';

import { uniqueBy } from '@shared/lib/setUtils';

import { TechnologyData } from './TechnologyTypes';

export const TechnologyHierarchy: React.FC = () => {
  const { technologies } = useDataContext();
  const sortFunction = getSortFunction();

  const roots = useMemo(
    () =>
      uniqueBy(
        technologies
          .filter((tech) => tech.parentTech == null)
          .map((tech) => tech.organization ?? tech),
        (t) => t.ID,
      ),
    [technologies],
  );

  const rootNodes = getTreeNodes(roots, sortFunction);

  return (
    <TreeListPageBody
      rootNodes={rootNodes}
      description={
        <>This shows select technologies for which we have keyboard and/or language data.</>
      }
    />
  );
};

function getTreeNodes(
  ent: (OrganizationData | TechnologyData)[],
  sortFunction: (a: EntityData, b: EntityData) => number,
): TreeNodeData[] {
  return ent
    .slice()
    .sort(sortFunction)
    .map((ent) => getTreeNode(ent, sortFunction));
}

function getTreeNode(
  ent: OrganizationData | TechnologyData,
  sortFunction: (a: EntityData, b: EntityData) => number,
): TreeNodeData {
  const children =
    ent.type === EntityType.Org ? ent.techs?.filter((t) => t.parentTech == null) : ent.childTechs;

  return {
    type: ent.type,
    ent: ent,
    children: children?.length ? getTreeNodes(children, sortFunction) : [],
    labelStyle: { fontStyle: ent.type === EntityType.Org ? 'italic' : 'normal' },
  };
}
