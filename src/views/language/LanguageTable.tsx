import React from 'react';

import { useDataContext } from '../../data/DataContext';
import { LanguageData } from '../../types/LanguageTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CLDRCoverageInfo } from '../common/CLDRCoverageInfo';
import { CodeColumn, InfoButtonColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const LanguageTable: React.FC = () => {
  const { languages } = useDataContext();

  return (
    <ObjectTable<LanguageData>
      objects={Object.values(languages)}
      columns={[
        CodeColumn,
        NameColumn,
        {
          key: 'Scope',
          render: (lang) => lang.scope ?? lang.scope,
        },
        {
          key: 'Population',
          render: (lang) => lang.populationCited,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: 'Internet Technologies',
          render: (lang) => <CLDRCoverageInfo object={lang} />,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default LanguageTable;
