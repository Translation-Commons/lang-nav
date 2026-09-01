import React, { Fragment } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { EntityData } from '@entities/types/DataTypes';

import { BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbSeparator } from '@shared/ui/breadcrumb';

import { getEntityParents } from './getParentsAndDescendants';

const EntityPathParents: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (!ent) return null;

  const parents = getEntityParents(ent).filter((o) => o != null);
  if (parents.length > 2) {
    return <EntityPathParentsCompressed parents={parents} />;
  }

  return parents.map((o, i) => (
    <Fragment key={i}>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <HoverableEntityName ent={o} />
      </BreadcrumbItem>
    </Fragment>
  ));
};

// If there are too many parents, keep the root and the direct parent -- then hide the rest
const EntityPathParentsCompressed: React.FC<{ parents: EntityData[] }> = ({ parents }) => {
  const [showFullAncestry, setShowFullAncestry] = React.useState(false);
  const hiddenAncestors = parents.slice(1, -1).map((p, i) => (
    <React.Fragment key={'ancestor' + i}>
      {i !== 0 && <BreadcrumbSeparator />}
      <BreadcrumbItem>
        <HoverableEntityName ent={p} />
      </BreadcrumbItem>
    </React.Fragment>
  ));
  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <HoverableEntityName ent={parents[0]} />
      </BreadcrumbItem>
      <Hoverable
        onClick={() => setShowFullAncestry((prev) => !prev)}
        hoverContent={
          showFullAncestry
            ? 'Hide intermediate ancestors'
            : `Show ${hiddenAncestors.length} more ancestors`
        }
      >
        <div style={{ display: 'flex', gap: '.25em' }}>
          <BreadcrumbSeparator />
          <BreadcrumbEllipsis />
        </div>
      </Hoverable>
      {showFullAncestry && <>{hiddenAncestors}</>}
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <HoverableEntityName ent={parents[parents.length - 1]} />
      </BreadcrumbItem>
    </>
  );
};

export default EntityPathParents;
