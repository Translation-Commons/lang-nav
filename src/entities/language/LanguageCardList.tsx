import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

import CardList from '../../features/cardlist/CardList';

import LanguageCard from './LanguageCard';

const LanguageCardList: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();

  return (
    <CardList
      objects={languagesInSelectedSource}
      renderCard={(lang) => <LanguageCard lang={lang} includeRelations={true} />}
    />
  );
};

export default LanguageCardList;
