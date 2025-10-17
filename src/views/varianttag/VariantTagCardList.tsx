import React from 'react';

import { useDataContext } from '../../data/DataContext';
import CardList from '../common/CardList';

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
