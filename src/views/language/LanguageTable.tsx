import React, { useMemo } from 'react';

import { getScopeFilter } from '../../controls/filter';
import { useDataContext } from '../../data/DataContext';
import { LanguageData } from '../../types/LanguageTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CLDRCoverageInfo } from '../common/CLDRCoverageInfo';
import { CodeColumn, InfoButtonColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const LanguageTable: React.FC = () => {
  const { languages } = useDataContext();
  const scopeFilter = getScopeFilter();
  const languagesFiltered = useMemo(
    () => Object.values(languages).filter(scopeFilter),
    [scopeFilter],
  );

  return (
    <ObjectTable<LanguageData>
      objects={languagesFiltered}
      columns={[
        CodeColumn,
        NameColumn,
        {
          key: 'Scope',
          label: 'Scope',
          render: (lang) => lang.scope ?? lang.scope,
        },
        {
          key: 'Population', 
          label: 'Population',
          render: (lang) => lang.populationCited,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: 'InternetTechnologies',
          label: 'Internet Technologies',
          render: (lang) => <CLDRCoverageInfo object={lang} />,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default LanguageTable;
