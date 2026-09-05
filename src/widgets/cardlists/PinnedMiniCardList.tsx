import { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';

import MiniCardList from './MiniCardList';

const PinnedMiniCardList = () => {
  const { pinned } = usePageParams();
  const { getEntity } = useDataContext();
  const ents = useMemo(
    () => pinned.map((id) => getEntity(id)).filter((ent) => ent != null),
    [pinned, getEntity],
  );

  if (ents.length === 0) return null;

  return <MiniCardList ents={ents} />;
};

export default PinnedMiniCardList;
