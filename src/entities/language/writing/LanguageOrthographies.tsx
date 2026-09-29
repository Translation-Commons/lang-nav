import React, { useMemo } from 'react';

import MiniCardList from '@widgets/cardlists/MiniCardList';

import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { View } from '@features/params/PageParamTypes';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';

import getOrthographyColumns from '@entities/orthography/OrthographyColumns';
import { OrthographyData } from '@entities/orthography/OrthographyTypes';

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
      <LocalParamsProvider overrides={{ limit: 12, fieldFocus: Field.Example }}>
        {view === View.CardList && <MiniCardList ents={orthographies} />}
        {view === View.Table && <Table orthographies={orthographies} />}
      </LocalParamsProvider>
    </div>
  );
};

function Table({ orthographies }: { orthographies: OrthographyData[] }) {
  const columns = useMemo(() => getOrthographyColumns(), []);

  return (
    <InteractiveEntityTable<OrthographyData>
      tableID={TableID.Orthographies}
      ents={orthographies}
      columns={columns}
      shouldFilterUsingSearchBar={false}
    />
  );
}

export default LanguageOrthographies;
