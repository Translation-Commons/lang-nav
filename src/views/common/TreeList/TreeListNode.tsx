import React, { useEffect, useState } from 'react';

import { usePageParams } from '../../../controls/PageParamsContext';
import { ObjectData } from '../../../types/DataTypes';
import { ObjectType, SearchableField, View } from '../../../types/PageParamTypes';
import HoverableObject from '../HoverableObject';
import { getObjectPopulation, ObjectFieldHighlightedByPageSearch } from '../ObjectField';

import './treelist.css';
import { useTreeListOptionsContext } from './TreeListOptions';

export type TreeNodeData = {
  children: TreeNodeData[];
  object: ObjectData;
  type: ObjectType;
  labelStyle?: React.CSSProperties;
  descendentsPassFilter?: boolean;
};

type Props = {
  nodeData: TreeNodeData;
  isExpandedInitially?: boolean;
};

const TreeListNode: React.FC<Props> = ({ nodeData, isExpandedInitially = false }) => {
  const { children, object, labelStyle, descendentsPassFilter } = nodeData;
  const { view, searchBy, searchString } = usePageParams();
  const [expanded, setExpanded] = useState(isExpandedInitially || descendentsPassFilter);
  const [seeAllChildren, setSeeAllChildren] = useState(false);
  const { limit } = usePageParams();
  const {
    allExpanded,
    showInfoButton,
    showObjectIDs: showObjectIDsSetting,
    showPopulation,
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
    () => setExpanded(isExpandedInitially || descendentsPassFilter || allExpanded),
    [descendentsPassFilter, allExpanded],
  );
  const population = getObjectPopulation(object);

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
          <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.EngName} />
        </span>
        {showObjectIDs && (
          <>
            {' '}
            [<ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Code} />]
          </>
        )}
        {showInfoButton && (
          <HoverableObject object={object}>
            <button className="InfoButton">&#x24D8;</button>
          </HoverableObject>
        )}
        {showPopulation && population > 0 && (
          <div className="TreeListPopulation">{population.toLocaleString()}</div>
        )}
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
                className="TreeListSeeAllDescendents"
                onClick={() => setSeeAllChildren((prev) => !prev)}
              >
                See {children.length - limit} more descendents
              </button>
            </li>
          )}
        </ul>
      )}
    </li>
  );
};

export default TreeListNode;
