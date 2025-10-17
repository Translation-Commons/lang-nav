import React from 'react';

import { useDataContext } from '../../data/DataContext';
import CardList from '../common/CardList';

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
