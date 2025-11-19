import React, { useCallback, useMemo } from 'react';

import { getFilterBySubstring, getFilterByVitality } from '@features/filtering/filter';
import { getFilterByConnections } from '@features/filtering/filterByConnections';
import Hoverable from '@features/hovercard/Hoverable';
import usePageParams from '@features/page-params/usePageParams';
import LimitSelector from '@features/pagination/LimitSelector';

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
    vitalityEth2013,
    vitalityEth2025,
    vitalityISO,
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
      vitalityEth2013 ||
      vitalityEth2025 ||
      vitalityISO,
    [
      searchString,
      territoryFilter,
      writingSystemFilter,
      languageFilter,
      vitalityEth2013,
      vitalityEth2025,
      vitalityISO,
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
        <div style={{ marginBottom: '.5em' }}>
          {description}
          {limit < rootNodes.length && (
            <>
              {' '}
              <Hoverable
                hoverContent={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
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
