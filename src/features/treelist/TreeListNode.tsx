import { ChevronDownIcon, ChevronRightIcon, InfoIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import HoverableObject from '@features/layers/hovercard/HoverableObject';
import { ObjectType, SearchableField, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { ObjectData } from '@entities/types/DataTypes';

import { Button } from '@shared/ui/button';

import TreeListNodeData from './TreeListNodeData';
import { useTreeListOptionsContext } from './TreeListOptions';

import './treelist.css';

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
  const { children, object, labelStyle } = nodeData;
  const { view, searchBy, searchString, fieldFocus } = usePageParams();
  const [seeAllChildren, setSeeAllChildren] = useState(false);
  const { limit } = usePageParams();
  const {
    allExpanded,
    showInfoButton,
    showObjectIDs: showObjectIDsSetting,
  } = useTreeListOptionsContext();
  const [expanded, setExpanded] = useState(isExpandedInitially || allExpanded);
  let showObjectIDs = showObjectIDsSetting;
  if (
    searchString != '' &&
    view === View.Hierarchy &&
    [SearchableField.Code, SearchableField.CodeOrNameAny].includes(searchBy)
  ) {
    showObjectIDs = true;
  }

  // Update the initial opening if a user is typing things in the search box
  useEffect(
    () => setExpanded(isExpandedInitially || allExpanded),
    [allExpanded, isExpandedInitially],
  );

  return (
    <li>
      {children.length > 0 ? (
        <Button
          variant="ghost"
          size="icon-xs"
          className="mr-1 align-middle"
          aria-label={expanded ? 'Collapse' : 'Expand'}
          aria-expanded={expanded}
          onClick={() => {
            setExpanded((prev) => !prev);
            setSeeAllChildren(false);
          }}
        >
          {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </Button>
      ) : (
        <span className="mr-1 inline-block size-6 align-middle" />
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
        {fieldFocus !== Field.None && <TreeListNodeData object={object} field={fieldFocus} />}
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
              <Button
                variant="link"
                size="sm"
                className="h-auto px-1"
                onClick={() => setSeeAllChildren((prev) => !prev)}
              >
                See {children.length - limit} more descendants
              </Button>
            </li>
          )}
        </ul>
      )}
    </li>
  );
};

export default TreeListNode;
