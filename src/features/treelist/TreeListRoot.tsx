import React from 'react';

import { EntityData } from '@entities/types/DataTypes';
import './treelist.css';

import TreeListNode, { TreeNodeData } from './TreeListNode';

type Props = {
  rootNodes: TreeNodeData[];
  getColor?: (ent: EntityData) => string | undefined;
};

const TreeListRoot: React.FC<Props> = ({ rootNodes, getColor }) => {
  return (
    <ul className="TreeListRoot">
      {rootNodes.map((node, i) => (
        <TreeListNode
          key={node.ent.ID}
          nodeData={node}
          isExpandedInitially={i === 0}
          getColor={getColor}
        />
      ))}
    </ul>
  );
};

export default TreeListRoot;
