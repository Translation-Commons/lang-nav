import React from 'react';

import CardList from '@widgets/cardlists/CardList';

import { useDataContext } from '@features/data-loading/DataContext';

import VariantTagCard from '@entities/varianttag/VariantTagCard';

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
