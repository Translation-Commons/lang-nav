import { ObjectData } from '@entities/types/DataTypes';

import { TreeNodeData } from './TreeListNode';

export function filterBranch(
  node: TreeNodeData,
  filterFunction?: (a: ObjectData) => boolean,
): TreeNodeData | undefined {
  if (!filterFunction) {
    // If there is no filter function, don't change the node or filter descendants
    node.descendantsPassFilter = undefined;
    return node;
  }

  // Filter the children to see if descendant nodes pass
  const filteredChildren = node.children
    .map((child) => filterBranch(child, filterFunction))
    .filter((node) => node != null);

  // If it has children that also pass the filter, then open this node
  if (filteredChildren.length > 0) {
    node.descendantsPassFilter = true;
  } else {
    node.descendantsPassFilter = false;
  }

  if (!filterFunction(node.object)) {
    // If it does not pass the filter, we may drop this branch from the tree if there are no descendants that pass the filter
    if (filteredChildren.length === 0) {
      return undefined;
    }

    // Otherwise, a child node passed the filter, so we'll keep it
    // Only show the children that pass the filter
    node.children = filteredChildren;
  }

  // Otherwise we will return the original node / not filter its children
  return node;
}
