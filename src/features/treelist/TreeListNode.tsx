import { InfoIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import HoverableObject from '@features/hovercard/HoverableObject';
import { ObjectType, SearchableField, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';
import { ObjectFieldHighlightedByPageSearch } from '@entities/ui/ObjectField';

import './treelist.css';

import TreeListNodeData from './TreeListNodeData';
import { useTreeListOptionsContext } from './TreeListOptions';

export type TreeNodeData = {
  children: TreeNodeData[];
  object: ObjectData;
  type: ObjectType;
  labelStyle?: React.CSSProperties;
  descendantsPassFilter?: boolean;
};

type Props = {
  nodeData: TreeNodeData;
  isExpandedInitially?: boolean;
};

const TreeListNode: React.FC<Props> = ({ nodeData, isExpandedInitially = false }) => {
  const { children, object, labelStyle, descendantsPassFilter } = nodeData;
  const { view, searchBy, searchString } = usePageParams();
  const [expanded, setExpanded] = useState(isExpandedInitially || descendantsPassFilter);
  const [seeAllChildren, setSeeAllChildren] = useState(false);
  const { limit } = usePageParams();
  const {
    allExpanded,
    showInfoButton,
    showObjectIDs: showObjectIDsSetting,
    showData,
  } = useTreeListOptionsContext();
  let showObjectIDs = showObjectIDsSetting;
  if (
    searchString != '' &&
    view === View.Hierarchy &&
    [SearchableField.Code, SearchableField.NameOrCode].includes(searchBy)
  ) {
    showObjectIDs = true;
  }

  // Update the initial opening if a user is typing things in the search box
  useEffect(
    () => setExpanded(isExpandedInitially || descendantsPassFilter || allExpanded),
    [descendantsPassFilter, allExpanded],
  );

  return (
    <li>
      {children.length > 0 ? (
        <button
          className="TreeListExpandBranch"
          onClick={() => {
            setExpanded((prev) => !prev);
            setSeeAllChildren(false);
          }}
        >
          {expanded ? `▼` : `▶`}
        </button>
      ) : (
        <div className="TreeListExpandBranch empty" />
      )}
      <>
        <span style={labelStyle}>
          <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.NameDisplay} />
        </span>
        {showObjectIDs && (
          <>
            {' '}
            [<ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Code} />]
          </>
        )}
        {showInfoButton && (
          <HoverableObject object={object} style={{ marginLeft: '0.125em' }}>
            <InfoIcon size="1em" />
          </HoverableObject>
        )}
        {showData !== 'None' && <TreeListNodeData object={object} field={showData} />}
      </>
      {expanded && children.length > 0 && (
        <ul className="TreeListBranch">
          {children
            .slice(0, limit > 0 && !seeAllChildren && !allExpanded ? limit : undefined)
            .map((child, i) => (
              <TreeListNode key={child.object.ID} nodeData={child} isExpandedInitially={i === 0} />
            ))}
          {limit > 0 && children.length > limit && !seeAllChildren && !allExpanded && (
            <li>
              <button
                className="TreeListSeeAllDescendants"
                onClick={() => setSeeAllChildren((prev) => !prev)}
              >
                See {children.length - limit} more descendants
              </button>
            </li>
          )}
        </ul>
      )}
    </li>
  );
};

export default TreeListNode;
