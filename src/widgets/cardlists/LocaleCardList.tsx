import React from 'react';

import CardList from '@widgets/cardlists/CardList';

import { useDataContext } from '@features/data-loading/context/useDataContext';

import LocaleCard from '@entities/locale/LocaleCard';

const LocaleCardList: React.FC = () => {
  const { locales } = useDataContext();

  return <CardList objects={locales} renderCard={(locale) => <LocaleCard locale={locale} />} />;
};

export default LocaleCardList;
