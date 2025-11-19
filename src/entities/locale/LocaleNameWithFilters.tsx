import React from 'react';

import HoverableObject from '@features/hovercard/HoverableObject';
import { SearchableField } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { LocaleData } from '@entities/types/DataTypes';

import Highlightable from '@shared/ui/Highlightable';

import { getLocaleName } from './LocaleStrings';

const LocaleNameWithFilters: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { territoryFilter, searchBy, searchString } = usePageParams();

  const name = getLocaleName(locale, !territoryFilter);

  const searchPattern =
    searchBy === SearchableField.AllNames ||
    searchBy === SearchableField.EngName ||
    searchBy === SearchableField.NameOrCode
      ? searchString
      : '';

  return (
    <HoverableObject object={locale}>
      <Highlightable text={name} searchPattern={searchPattern} />
    </HoverableObject>
  );
};

export default LocaleNameWithFilters;
