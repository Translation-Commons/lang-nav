import React from 'react';

import { useDataContext } from '../../data/DataContext';
import CardList from '../common/CardList';

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
