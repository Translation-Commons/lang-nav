import CardList from '@features/cardlist/CardList';
import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

import VariantTagCard from './VariantTagCard';

const VariantTagCardList: React.FC = () => {
  const { variantTags } = useDataContext();

  return (
    <CardList
      objects={variantTags}
      renderCard={(variantTag) => <VariantTagCard data={variantTag} />}
    />
  );
};

export default VariantTagCardList;
