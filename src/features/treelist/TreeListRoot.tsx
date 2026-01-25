import React from 'react';

import './treelist.css';

import TreeListNode, { TreeNodeData } from './TreeListNode';

type Props = {
  rootNodes: TreeNodeData[];
};

const TreeListRoot: React.FC<Props> = ({ rootNodes }) => {
  return (
    <ul className="TreeListRoot">
      {rootNodes.map((node, i) => (
        <TreeListNode key={node.object.ID} nodeData={node} isExpandedInitially={i === 0} />
      ))}
    </ul>
  );
};

export default TreeListRoot;
