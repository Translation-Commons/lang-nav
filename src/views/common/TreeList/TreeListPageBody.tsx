import React, { useCallback } from 'react';

import { getFilterBySubstring, getFilterByTerritory } from '../../../controls/filter';
import { usePageParams } from '../../../controls/PageParamsContext';
import { ObjectData } from '../../../types/DataTypes';

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
  const { limit, searchString } = usePageParams();
  const filterBySubstring = getFilterBySubstring();
  const filterByTerritory = getFilterByTerritory();
  const filterFunction = useCallback(
    (object: ObjectData) => {
      return filterBySubstring(object) && filterByTerritory(object);
    },
    [filterBySubstring, filterByTerritory],
  );

  return (
    <div className="TreeListView">
      <TreeListOptionsProvider>
        <div style={{ marginBottom: 8 }}>
          {description}
          {limit < rootNodes.length && (
            <>
              {' '}
              {limit} of {rootNodes.length} root nodes are shown. Update the item limit in the
              options panel to see more.
            </>
          )}
        </div>

        <TreeListRoot
          rootNodes={rootNodes
            .map((node) => filterBranch(node, searchString !== '' ? filterFunction : undefined))
            .filter((node) => node != null)
            .slice(0, limit > 0 ? limit : undefined)}
        />
        <TreeListOptionsSelectors />
      </TreeListOptionsProvider>
    </div>
  );
};

export default TreeListPageBody;
