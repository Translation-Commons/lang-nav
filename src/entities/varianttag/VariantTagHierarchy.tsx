import React from 'react';

import { ObjectType } from '@widgets/PageParamTypes';

import { useDataContext } from '@features/data-loading/DataContext';
import { getSortFunction } from '@features/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import getObjectFromID from '@entities/lib/getObjectFromID';
import { ObjectData, VariantTagData } from '@entities/types/DataTypes';

export const VariantTagHierarchy: React.FC = () => {
  const { variantTags } = useDataContext();
  const sortFunction = getSortFunction();

  const nodeHierarchy = getNodeHierarchy(variantTags);
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

type VariantTagBranch = {
  key: string;
  variantTag?: VariantTagData;
  branches: Record<string, VariantTagBranch>;
};

export function getNodeHierarchy(variantTags: VariantTagData[]): Record<string, VariantTagBranch> {
  return variantTags.reduce<Record<string, VariantTagBranch>>((rootNodes, variantTag) => {
    const prefixes = variantTag.prefixes;

    prefixes.forEach((prefix) => {
      // Follow the full path of the pieces of the locale code, from prefix to the variant tag ID
      const parts = [...prefix.split('-'), variantTag.ID];

      parts.reduce<Record<string, VariantTagBranch>>((parentNode, part, index) => {
        // Fetch the node or initialize it if it doesn't exist
        const node = parentNode[part] || { key: part, branches: {} };
        if (!parentNode[part]) parentNode[part] = node;

        // Add the variant tag as a leaf if we are at the end
        if (index === parts.length - 1) {
          node.variantTag = variantTag;
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
  nodeHierarchy: Record<string, VariantTagBranch>,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
): TreeNodeData[] {
  return Object.values(nodeHierarchy)
    .map(getVariantTagTreeNode)
    .filter((node) => node != null)
    .sort((a, b) => sortFunction(a.object, b.object));
}

export function getVariantTagTreeNode(VariantTagBranch: VariantTagBranch): TreeNodeData | null {
  const object = getObjectFromID(VariantTagBranch.key);
  if (object == null) return null;
  return {
    type: object?.type ?? ObjectType.VariantTag,
    object: VariantTagBranch.variantTag ?? object,
    children: getTreeNodes(VariantTagBranch.branches, getSortFunction()),
    labelStyle: { fontWeight: object?.type === ObjectType.VariantTag ? 'normal' : 'bold' },
  };
}
