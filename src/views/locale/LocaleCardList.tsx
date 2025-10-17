import React from 'react';

import { useDataContext } from '../../data/DataContext';
import CardList from '../common/CardList';

import LocaleCard from './LocaleCard';

const LocaleCardList: React.FC = () => {
  const { locales } = useDataContext();

  return <CardList objects={locales} renderCard={(locale) => <LocaleCard locale={locale} />} />;
};

export default LocaleCardList;
