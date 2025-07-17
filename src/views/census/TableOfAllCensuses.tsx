import React from 'react';

import { useDataContext } from '../../data/DataContext';
import CommaSeparated from '../../generic/CommaSeparated';
import Hoverable from '../../generic/Hoverable';
import { CensusData } from '../../types/CensusTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CodeColumn, InfoButtonColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const TableOfAllCensuses: React.FC = () => {
  const { censuses, languages } = useDataContext();

  return (
    <ObjectTable<CensusData>
      objects={Object.values(censuses)}
      columns={[
        CodeColumn,
        NameColumn,
        {
          key: 'Languages',
          render: (census) => (
            <Hoverable
              hoverContent={
                <CommaSeparated>
                  {Object.entries(census.languageEstimates)
                    .sort((a, b) => b[1] - a[1])
                    .map((lang) => languages[lang[0]]?.nameDisplay)}
                </CommaSeparated>
              }
            >
              {census.languageCount}
            </Hoverable>
          ),
          isNumeric: true,
          sortParam: SortBy.CountOfLanguages,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default TableOfAllCensuses;
