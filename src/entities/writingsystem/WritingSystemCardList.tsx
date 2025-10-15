import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

import CardList from '../../features/cardlist/CardList';

import WritingSystemCard from './WritingSystemCard';

const WritingSystemCardList: React.FC = () => {
  const { writingSystems } = useDataContext();

  return (
    <CardList
      objects={writingSystems}
      renderCard={(writingSystem) => <WritingSystemCard writingSystem={writingSystem} />}
    />
  );
};

export default WritingSystemCardList;
