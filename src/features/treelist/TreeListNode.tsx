import { InfoIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import HoverableEntity from '@features/layers/hovercard/HoverableEntity';
import { EntityType, SearchableField, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import EntityFieldHighlightedByPageSearch from '@features/transforms/search/EntityFieldHighlightedByPageSearch';

import { EntityData } from '@entities/types/DataTypes';

import TreeListNodeData from './TreeListNodeData';
import { useTreeListOptionsContext } from './TreeListOptions';

import './treelist.css';

export type TreeNodeData = {
  children: TreeNodeData[];
  ent: EntityData;
  type: EntityType;
  labelStyle?: React.CSSProperties;
  descendantsPassFilter?: boolean;
};

type Props = {
  nodeData: TreeNodeData;
  isExpandedInitially?: boolean;
};

const TreeListNode: React.FC<Props> = ({ nodeData, isExpandedInitially = false }) => {
  const { children, ent, labelStyle } = nodeData;
  const { view, searchBy, searchString, fieldFocus } = usePageParams();
  const [seeAllChildren, setSeeAllChildren] = useState(false);
  const { limit } = usePageParams();
  const {
    allExpanded,
    showInfoButton,
    showEntIDs: showEntIDsSetting,
  } = useTreeListOptionsContext();
  const [expanded, setExpanded] = useState(isExpandedInitially || allExpanded);
  let showEntIDs = showEntIDsSetting;
  if (
    searchString != '' &&
    view === View.Hierarchy &&
    [SearchableField.Code, SearchableField.CodeOrNameAny].includes(searchBy)
  ) {
    showEntIDs = true;
  }

  // Update the initial opening if a user is typing things in the search box
  useEffect(
    () => setExpanded(isExpandedInitially || allExpanded),
    [allExpanded, isExpandedInitially],
  );

  return (
    <li>
      {children.length > 0 ? (
        <button
          className="TreeListExpandBranch"
          style={{ padding: '0 0.5em' }}
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
          <EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameDisplay} />
        </span>
        {showEntIDs && (
          <>
            {' '}
            [<EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.Code} />]
          </>
        )}
        {showInfoButton && (
          <HoverableEntity ent={ent} style={{ marginLeft: '0.125em' }}>
            <InfoIcon size="1em" />
          </HoverableEntity>
        )}
        {fieldFocus !== Field.None && <TreeListNodeData ent={ent} field={fieldFocus} />}
      </>
      {expanded && children.length > 0 && (
        <ul className="TreeListBranch">
          {children
            .slice(0, limit > 0 && !seeAllChildren && !allExpanded ? limit : undefined)
            .map((child, i) => (
              <TreeListNode key={child.ent.ID} nodeData={child} isExpandedInitially={i === 0} />
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
