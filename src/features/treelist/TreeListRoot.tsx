import React from 'react';

import './treelist.css';

import TreeListNode, { TreeNodeData } from './TreeListNode';

type Props = {
  rootNodes: TreeNodeData[];
  suppressExpansion?: boolean;
};

const TreeListRoot: React.FC<Props> = ({ rootNodes, suppressExpansion }) => {
  return (
    <ul className="TreeListRoot">
      {rootNodes.map((node, i) => (
        <TreeListNode
          key={node.object.ID}
          nodeData={node}
          isExpandedInitially={!suppressExpansion && i === 0}
        />
      ))}
    </ul>
  );
};

export default TreeListRoot;
