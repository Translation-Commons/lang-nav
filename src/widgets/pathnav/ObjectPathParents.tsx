import { EllipsisIcon, SlashIcon } from 'lucide-react';
import React, { Fragment } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { EntityData } from '@entities/types/DataTypes';

import { getObjectParents } from './getParentsAndDescendants';

const ObjectPathParents: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (!ent) return null;

  const parents = getObjectParents(ent).filter((o) => o != null);
  if (parents.length > 2) {
    return <ObjectPathParentsCompressed parents={parents} />;
  }

  return parents.map((o, i) => (
    <Fragment key={i}>
      <SlashIcon size="1em" />
      <HoverableObjectName ent={o} />
    </Fragment>
  ));
};

// If there are too many parents, keep the root and the direct parent -- then hide the rest
const ObjectPathParentsCompressed: React.FC<{ parents: EntityData[] }> = ({ parents }) => {
  const [showFullAncestry, setShowFullAncestry] = React.useState(false);
  const hiddenAncestors = parents.slice(1, -1).map((p, i) => (
    <React.Fragment key={'ancestor' + i}>
      {i !== 0 && <SlashIcon size="1em" />}
      <HoverableObjectName ent={p} />
    </React.Fragment>
  ));
  return (
    <>
      <SlashIcon size="1em" />
      <HoverableObjectName ent={parents[0]} />
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
      <HoverableObjectName ent={parents[parents.length - 1]} />
    </>
  );
};

export default ObjectPathParents;
