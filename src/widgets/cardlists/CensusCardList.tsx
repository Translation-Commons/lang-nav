import React from 'react';

import CardList from '@widgets/cardlists/CardList';

import { useDataContext } from '@features/data-loading/context/useDataContext';

import CensusCard from '@entities/census/CensusCard';

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
