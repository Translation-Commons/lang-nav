import React from 'react';

import CardList from '@features/cardlist/CardList';
import { useDataContext } from '@features/data-loading/DataContext';

import LocaleCard from './LocaleCard';

const LocaleCardList: React.FC = () => {
  const { locales } = useDataContext();

  return <CardList objects={locales} renderCard={(locale) => <LocaleCard locale={locale} />} />;
};

export default LocaleCardList;
