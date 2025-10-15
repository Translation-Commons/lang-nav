import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

import CardList from '../../features/cardlist/CardList';

import TerritoryCard from './TerritoryCard';

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
