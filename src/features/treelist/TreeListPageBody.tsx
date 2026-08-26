import React, { useCallback, useMemo } from 'react';

import LimitInput from '@features/pagination/LimitInput';
import usePageParams from '@features/params/usePageParams';
import { useFilterByVitality } from '@features/transforms/filtering/filter';
import { getFilterByConnections } from '@features/transforms/filtering/filterByConnections';
import getFilterBySubstring from '@features/transforms/search/getFilterBySubstring';

import { EntityData } from '@entities/types/DataTypes';

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
  const { limit, searchString, territoryFilter, writingSystemFilter, languageFilter, isoStatus } =
    usePageParams();
  const filterBySubstring = getFilterBySubstring();
  const filterByConnections = getFilterByConnections();
  const filterByVitality = useFilterByVitality();
  const filterActive = useMemo(
    () => searchString || territoryFilter || writingSystemFilter || languageFilter || isoStatus,
    [searchString, territoryFilter, writingSystemFilter, languageFilter, isoStatus],
  );
  const filterFunction = useCallback(
    (ent: EntityData) =>
      filterBySubstring(ent) && filterByConnections(ent) && filterByVitality(ent),
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
              Up to <LimitInput className="inline-block" showTitle={false} /> of{' '}
              {rootNodes.length.toLocaleString()} root nodes are shown.
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
