import React from 'react';

import HoverableEntity from '@features/layers/hovercard/HoverableEntity';
import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LocaleData } from '@entities/locale/LocaleTypes';

import Highlightable from '@shared/ui/Highlightable';

import { getLocaleName } from './LocaleStrings';

const LocaleNameWithFilters: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { territoryFilter, searchBy, searchString } = usePageParams();

  const name = getLocaleName(locale, !territoryFilter);

  const searchPattern = searchBy !== SearchableField.Code ? searchString : '';

  return (
    <HoverableEntity ent={locale}>
      <Highlightable text={name} searchPattern={searchPattern} />
    </HoverableEntity>
  );
};

export default LocaleNameWithFilters;
