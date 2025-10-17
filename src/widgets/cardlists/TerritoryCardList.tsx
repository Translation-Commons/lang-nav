import React from 'react';

import CardList from '@widgets/cardlists/CardList';

import { useDataContext } from '@features/data-loading/DataContext';

import TerritoryCard from '@entities/territory/TerritoryCard';

const TerritoryCardList: React.FC = () => {
  const { territories } = useDataContext();

  return (
    <CardList
      objects={territories}
      renderCard={(territory) => <TerritoryCard territory={territory} />}
    />
  );
};

export default TerritoryCardList;
