import LanguageCard from '@entities/language/LanguageCard';
import CardList from '@features/cardlist/CardList';
import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

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
