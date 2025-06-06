import React from 'react';

import { getSubstringFilter } from '../../../controls/filter';
import { usePageParams } from '../../../controls/PageParamsContext';

import { filterBranch } from './filterBranch';
import { TreeNodeData } from './TreeListNode';
import { TreeListOptionsProvider, TreeListOptionsSelectors } from './TreeListOptions';
import TreeListRoot from './TreeListRoot';
import './treelist.css';

type Props = {
  rootNodes: TreeNodeData[];
  description: React.ReactNode;
};

const TreeListPageBody: React.FC<Props> = ({ rootNodes, description }) => {
  const { limit } = usePageParams();
  const substringFilterFunction = getSubstringFilter();

  return (
    <div className="TreeListView">
      <TreeListOptionsProvider>
        <div style={{ marginBottom: 8 }}>{description}</div>
        <TreeListRoot
          rootNodes={rootNodes
            .map((node) => filterBranch(node, substringFilterFunction))
            .filter((node) => node != null)
            .slice(0, limit > 0 ? limit : undefined)}
        />
        <TreeListOptionsSelectors />
      </TreeListOptionsProvider>
    </div>
  );
};

export default TreeListPageBody;
