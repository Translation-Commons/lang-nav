import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import MiniCardList from './MiniCardList';

const CurrentEntityMiniCardList: React.FC = () => {
  const { filteredEntities } = useFilteredEntities({});

  return <MiniCardList ents={filteredEntities.slice(0, 12)} />;
};

export default CurrentEntityMiniCardList;
