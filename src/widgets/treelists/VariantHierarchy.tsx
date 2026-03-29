import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import getObjectFromID from '@entities/lib/getObjectFromID';
import { ObjectData } from '@entities/types/DataTypes';
import { VariantData } from '@entities/variant/VariantTypes';

export const VariantHierarchy: React.FC = () => {
  const { variants } = useDataContext();
  const sortFunction = getSortFunction();

  const nodeHierarchy = getNodeHierarchy(variants);
  const rootNodes: TreeNodeData[] = getTreeNodes(nodeHierarchy, sortFunction);

  return (
    <TreeListPageBody
      rootNodes={rootNodes}
      description={
        <>
          Variant tags are associated with different &quot;prefixes&quot; (entities in bold) --
          usually but not always language codes. This view organizes variant tags by the prefixes
          they apply to.
        </>
      }
    />
  );
};

type VariantBranch = {
  key: string;
  variant?: VariantData;
  branches: Record<string, VariantBranch>;
};

export function getNodeHierarchy(variants: VariantData[]): Record<string, VariantBranch> {
  return variants.reduce<Record<string, VariantBranch>>((rootNodes, variant) => {
    const prefixes = variant.prefixes;

    prefixes.forEach((prefix) => {
      // Follow the full path of the pieces of the locale code, from prefix to the variant tag ID
      const parts = [...prefix.split('-'), variant.ID];

      parts.reduce<Record<string, VariantBranch>>((parentNode, part, index) => {
        // Fetch the node or initialize it if it doesn't exist
        const node = parentNode[part] || { key: part, branches: {} };
        if (!parentNode[part]) parentNode[part] = node;

        // Add the variant tag as a leaf if we are at the end
        if (index === parts.length - 1) {
          node.variant = variant;
        }
        // Otherwise, continue down the branches
        return node.branches;
      }, rootNodes);

      return rootNodes;
    });

    return rootNodes;
  }, {});
}

export function getTreeNodes(
  nodeHierarchy: Record<string, VariantBranch>,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
): TreeNodeData[] {
  return Object.values(nodeHierarchy)
    .map(getVariantTreeNode)
    .filter((node) => node != null)
    .sort((a, b) => sortFunction(a.object, b.object));
}

export function getVariantTreeNode(VariantBranch: VariantBranch): TreeNodeData | null {
  const object = getObjectFromID(VariantBranch.key);
  if (object == null) return null;
  return {
    type: object?.type ?? ObjectType.Variant,
    object: VariantBranch.variant ?? object,
    children: getTreeNodes(VariantBranch.branches, getSortFunction()),
    labelStyle: { fontWeight: object?.type === ObjectType.Variant ? 'normal' : 'bold' },
  };
}
