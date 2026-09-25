import React, { useMemo } from 'react';

import MiniCardList from '@widgets/cardlists/MiniCardList';
import getOrthographyColumns from '@widgets/tables/columns/OrthographyColumns';

import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { View } from '@features/params/PageParamTypes';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import { Orthography } from '@entities/orthography/OrthographyTypes';

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
            {view === View.CardList && <MiniCardList ents={orthographies} />}
            {view === View.Table && <Table orthographies={orthographies} />}
        </div>
    );
};

function Table({ orthographies }: { orthographies: Orthography[] }) {
    const columns = useMemo(() => getOrthographyColumns(), []);

    return (
        <LocalParamsProvider overrides={{ limit: 12 }}>
            <InteractiveEntityTable<Orthography>
                tableID={TableID.Orthographies}
                ents={orthographies}
                columns={columns}
                shouldFilterUsingSearchBar={false}
            />
        </LocalParamsProvider>
    );
}

export default LanguageOrthographies;