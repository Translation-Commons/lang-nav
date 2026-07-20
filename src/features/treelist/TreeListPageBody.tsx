import React, { useCallback, useMemo } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import LimitSelector from '@features/pagination/LimitSelector';
import usePageParams from '@features/params/usePageParams';
import { getFilterByVitality } from '@features/transforms/filtering/filter';
import { getFilterByConnections } from '@features/transforms/filtering/filterByConnections';
import getFilterBySubstring from '@features/transforms/search/getFilterBySubstring';

import { ObjectData } from '@entities/types/DataTypes';

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
  const {
    limit,
    searchString,
    territoryFilter,
    writingSystemFilter,
    languageFilter,
    vitalityEthFine,
    vitalityEthCoarse,
    isoStatus,
  } = usePageParams();
  const filterBySubstring = getFilterBySubstring();
  const filterByConnections = getFilterByConnections();
  const filterByVitality = getFilterByVitality();
  const filterActive = useMemo(
    () =>
      searchString ||
      territoryFilter ||
      writingSystemFilter ||
      languageFilter ||
      vitalityEthFine ||
      vitalityEthCoarse ||
      isoStatus,
    [
      searchString,
      territoryFilter,
      writingSystemFilter,
      languageFilter,
      vitalityEthFine,
      vitalityEthCoarse,
      isoStatus,
    ],
  );
  const filterFunction = useCallback(
    (object: ObjectData) => {
      return filterBySubstring(object) && filterByConnections(object) && filterByVitality(object);
    },
    [filterBySubstring, filterByConnections, filterByVitality],
  );

  return (
    <div className="TreeListView">
      <TreeListOptionsProvider>
        <div className="mb-2">
          {description}
          {limit < rootNodes.length && (
            <>
              {' '}
              <Hoverable
                hoverContent={
                  <div className="flex flex-col gap-2">
                    <div>Set the number of root nodes that are shown.</div>
                    <LimitSelector />
                  </div>
                }
              >
                {limit.toLocaleString()}
              </Hoverable>{' '}
              of {rootNodes.length.toLocaleString()} root nodes are shown.
            </>
          )}
        </div>

        <TreeListRoot
          rootNodes={rootNodes
            .map((node) => filterBranch(node, filterActive ? filterFunction : undefined))
            .filter((node) => node != null)
            .slice(0, limit > 0 ? limit : undefined)}
        />
        <TreeListOptionsSelectors />
      </TreeListOptionsProvider>
    </div>
  );
};

export default TreeListPageBody;
