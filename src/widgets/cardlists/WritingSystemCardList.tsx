import React from 'react';

import CardList from '@widgets/cardlists/CardList';

import { useDataContext } from '@features/data-loading/context/useDataContext';

import WritingSystemCard from '@entities/writingsystem/WritingSystemCard';

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
