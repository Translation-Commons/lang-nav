import React, { useCallback, useMemo } from 'react';

import LimitInput from '@features/pagination/LimitInput';
import usePageParams from '@features/params/usePageParams';
import useColors from '@features/transforms/coloring/useColors';
import { useFilterByVitality } from '@features/transforms/filtering/filter';
import { getFilterByConnections } from '@features/transforms/filtering/filterByConnections';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import getFilterBySubstring from '@features/transforms/search/getFilterBySubstring';

import { EntityData } from '@entities/types/EntityTypes';

import CopyButton from '@shared/ui/CopyButton';

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
  const ents = useFilteredEntities({}).filteredEntities;
  const { getColor } = useColors({ ents });
  const activeRootNodes = useMemo(
    () =>
      rootNodes
        .map((node) => filterBranch(node, filterActive ? filterFunction : undefined))
        .filter((node) => node != null)
        .slice(0, limit > 0 ? limit : undefined),
    [rootNodes, filterActive, filterFunction, limit],
  );

  const getDataAsText = useCallback(
    () => activeRootNodes.map((node) => treeListNodeToString(node)).join('\n'),
    [activeRootNodes, filterActive, filterFunction, limit],
  );

  return (
    <div className="text-left max-w-[600px] mx-auto my-0  text-xs">
      <TreeListOptionsProvider>
        <div className="mb-2 text-sm">
          {description}
          {limit < rootNodes.length && (
            <>
              {' '}
              Up to <LimitInput className="inline-block" showTitle={false} /> of{' '}
              {rootNodes.length.toLocaleString()} root nodes are shown.
            </>
          )}
          <CopyButton getTextToCopy={getDataAsText}>Copy display as text</CopyButton>
        </div>

        <TreeListRoot rootNodes={activeRootNodes} getColor={getColor} />
        <TreeListOptionsSelectors />
      </TreeListOptionsProvider>
    </div>
  );
};

function treeListNodeToString(node: TreeNodeData, depth = 0): string {
  if (depth > 30) return '';
  const indent = '  '.repeat(depth);
  let result = `${indent}${node.ent.nameDisplay} [${node.ent.codeDisplay}]\n`;
  if (node.children) {
    for (const child of node.children) {
      result += treeListNodeToString(child, depth + 1);
    }
  }
  return result;
}

export default TreeListPageBody;
