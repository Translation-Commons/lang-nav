import { EllipsisIcon, SlashIcon } from 'lucide-react';
import React, { Fragment } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { EntityData } from '@entities/types/DataTypes';

import { getEntityParents } from './getParentsAndDescendants';

const EntityPathParents: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (!ent) return null;

  const parents = getEntityParents(ent).filter((o) => o != null);
  if (parents.length > 2) {
    return <EntityPathParentsCompressed parents={parents} />;
  }

  return parents.map((o, i) => (
    <Fragment key={i}>
      <SlashIcon size="1em" />
      <HoverableEntityName ent={o} />
    </Fragment>
  ));
};

// If there are too many parents, keep the root and the direct parent -- then hide the rest
const EntityPathParentsCompressed: React.FC<{ parents: EntityData[] }> = ({ parents }) => {
  const [showFullAncestry, setShowFullAncestry] = React.useState(false);
  const hiddenAncestors = parents.slice(1, -1).map((p, i) => (
    <React.Fragment key={'ancestor' + i}>
      {i !== 0 && <SlashIcon size="1em" />}
      <HoverableEntityName ent={p} />
    </React.Fragment>
  ));
  return (
    <>
      <SlashIcon size="1em" />
      <HoverableEntityName ent={parents[0]} />
      <Hoverable
        onClick={() => setShowFullAncestry((prev) => !prev)}
        hoverContent={
          showFullAncestry
            ? 'Hide intermediate ancestors'
            : `Show ${hiddenAncestors.length} more ancestors`
        }
      >
        <div style={{ display: 'flex', gap: '.25em' }}>
          <SlashIcon size="1em" display="block" />
          <EllipsisIcon size="1em" display="block" />
        </div>
      </Hoverable>
      {showFullAncestry && <>{hiddenAncestors}</>}
      <SlashIcon size="1em" />
      <HoverableEntityName ent={parents[parents.length - 1]} />
    </>
  );
};

export default EntityPathParents;
