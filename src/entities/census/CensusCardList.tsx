import React from 'react';

import CardList from '@features/cardlist/CardList';
import { useDataContext } from '@features/data-loading/DataContext';

import CensusCard from './CensusCard';

const CensusCardList: React.FC = () => {
  const { censuses } = useDataContext();

  return (
    <CardList
      objects={Object.values(censuses)}
      renderCard={(census) => <CensusCard census={census} />}
    />
  );
};

export default CensusCardList;
