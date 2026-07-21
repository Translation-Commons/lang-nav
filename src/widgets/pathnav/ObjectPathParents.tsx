import { SlashIcon } from 'lucide-react';
import React, { Fragment, useState } from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { ObjectData } from '@entities/types/DataTypes';

import { BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbSeparator } from '@shared/ui/breadcrumb';

import { getObjectParents } from './getParentsAndDescendants';

// Renders the ancestor chain as leading breadcrumb items (separator-first so the current
// object's item can follow directly). Must be rendered inside a BreadcrumbList.
const ObjectPathParents: React.FC<{ object?: ObjectData }> = ({ object }) => {
  const [showFullAncestry, setShowFullAncestry] = useState(false);
  if (!object) return null;

  const parents = getObjectParents(object).filter((o): o is ObjectData => o != null);
  if (parents.length === 0) return null;

  const renderParent = (parent: ObjectData) => (
    <Fragment key={parent.ID}>
      <BreadcrumbSeparator>
        <SlashIcon size="1em" />
      </BreadcrumbSeparator>
      <BreadcrumbItem>
        <HoverableObjectName object={parent} />
      </BreadcrumbItem>
    </Fragment>
  );

  // Short chains render inline; longer ones keep the root and the direct parent and collapse the
  // middle behind an ellipsis toggle that can expand and re-collapse.
  if (parents.length <= 2) {
    return <>{parents.map(renderParent)}</>;
  }

  const middle = parents.slice(1, -1);
  return (
    <>
      {renderParent(parents[0])}
      <BreadcrumbSeparator>
        <SlashIcon size="1em" />
      </BreadcrumbSeparator>
      <BreadcrumbItem>
        <button
          type="button"
          aria-label={
            showFullAncestry
              ? 'Hide intermediate ancestors'
              : `Show ${middle.length} more ancestors`
          }
          aria-expanded={showFullAncestry}
          className="flex items-center transition-colors hover:text-foreground"
          onClick={() => setShowFullAncestry((prev) => !prev)}
        >
          <BreadcrumbEllipsis />
        </button>
      </BreadcrumbItem>
      {showFullAncestry && middle.map(renderParent)}
      {renderParent(parents[parents.length - 1])}
    </>
  );
};

export default ObjectPathParents;
