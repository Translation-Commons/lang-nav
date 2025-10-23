import React from 'react';

import CardList from '@widgets/cardlists/CardList';

import { useDataContext } from '@features/data-loading/context/useDataContext';

import LanguageCard from '@entities/language/LanguageCard';

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
