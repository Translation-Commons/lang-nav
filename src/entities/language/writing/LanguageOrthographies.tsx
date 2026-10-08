import React from 'react';

import CurrentEntityMiniCardList from '@widgets/cardlists/CurrentEntityMiniCardList';

import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { View } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';
import { getFilterEntityID } from '@features/transforms/filtering/FilterEntityID';
import { BLANK_FILTER_PARAMS } from '@features/transforms/filtering/FilterParams';

import OrthographyTable from '@entities/orthography/OrthographyTable';
import { EntityType } from '@entities/types/EntityTypes';

import { LanguageData } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
  view: View;
};

const LanguageOrthographies: React.FC<Props> = ({ lang, view }) => {
  const orthographies = lang.orthographies ?? [];

  if (orthographies.length === 0) return null;

  return (
    <div className="text-xs">
      <LocalParamsProvider
        overrides={{
          limit: 12,
          fieldFocus: Field.Example,
          sortBy: Field.Example,

          ...BLANK_FILTER_PARAMS,
          entType: EntityType.Orthography,
          languageFilter: getFilterEntityID(lang),
        }}
      >
        {view === View.CardList && <CurrentEntityMiniCardList />}
        {view === View.Table && <OrthographyTable />}
      </LocalParamsProvider>
    </div>
  );
};

export default LanguageOrthographies;
