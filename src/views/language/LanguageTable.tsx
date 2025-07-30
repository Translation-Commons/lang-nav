import React from 'react';

import { useDataContext } from '../../data/DataContext';
import { LanguageData } from '../../types/LanguageTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CLDRCoverageText, ICUSupportStatus } from '../common/CLDRCoverageInfo';
import {
  CodeColumn,
  EndonymColumn,
  InfoButtonColumn,
  NameColumn,
} from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const LanguageTable: React.FC = () => {
  const { languages } = useDataContext();

  return (
    <ObjectTable<LanguageData>
      objects={Object.values(languages)}
      columns={[
        CodeColumn,
        NameColumn,
        EndonymColumn,
        {
          key: 'Scope',
          render: (lang) => lang.scope ?? lang.scope,
          isInitiallyVisible: false,
        },
        {
          key: 'Population',
          render: (lang) => lang.populationCited,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: 'CLDRCoverage',
          label: 'CLDR Coverage',
          render: (lang) => <CLDRCoverageText object={lang} />,
          isInitiallyVisible: false,
        },
        {
          key: 'ICUSupport',
          label: 'ICU Support',
          render: (lang) => <ICUSupportStatus object={lang} />,
          isInitiallyVisible: false,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default LanguageTable;
