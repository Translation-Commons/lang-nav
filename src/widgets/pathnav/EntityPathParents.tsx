import React, { Fragment } from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { EntityData } from '@entities/types/DataTypes';

import { BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbSeparator } from '@shared/ui/breadcrumb';
import { Button } from '@shared/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

import { getEntityParents } from './getParentsAndDescendants';

const EntityPathParents: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (!ent) return null;

  const parents = getEntityParents(ent).filter((o) => o != null);
  if (parents.length > 2) {
    return <EntityPathParentsCompressed parents={parents} />;
  }

  return parents.map((o, i) => (
    <Fragment key={i}>
      {i != 0 && <BreadcrumbSeparator />}
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
      <BreadcrumbItem>
        <HoverableEntityName ent={parents[0]} />
      </BreadcrumbItem>
      <BreadcrumbItem>
        <HoverCard>
          <HoverCardTrigger delay={10}>
            <Button
              className="flex gap-1 p-0"
              onClick={() => setShowFullAncestry((prev) => !prev)}
              variant="ghost"
            >
              <BreadcrumbSeparator />
              <BreadcrumbEllipsis />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-fit">
            {showFullAncestry
              ? 'Hide intermediate ancestors'
              : `Show ${hiddenAncestors.length} more ancestors`}
          </HoverCardContent>
        </HoverCard>
      </BreadcrumbItem>
      {showFullAncestry && <>{hiddenAncestors}</>}
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <HoverableEntityName ent={parents[parents.length - 1]} />
      </BreadcrumbItem>
    </>
  );
};

export default EntityPathParents;
