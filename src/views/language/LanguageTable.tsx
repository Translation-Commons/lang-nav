import React, { useMemo } from 'react';

import { getGranularityFilter } from '../../controls/filter';
import { useDataContext } from '../../data/DataContext';
import Hoverable from '../../generic/Hoverable';
import { LanguageData } from '../../types/LanguageTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CLDRCoverageInfo } from '../common/CLDRCoverageInfo';
import { CodeColumn, InfoButtonColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

import { LanguageScopesDescription } from './LanguageScopeDescription';

const LanguageTable: React.FC = () => {
  const { languages } = useDataContext();
  const filterByGranularity = getGranularityFilter();
  const languagesFiltered = useMemo(
    () => Object.values(languages).filter(filterByGranularity),
    [filterByGranularity],
  );

  return (
    <ObjectTable<LanguageData>
      objects={languagesFiltered}
      columns={[
        {
          label: <Hoverable hoverContent={<LanguageScopesDescription />}>Scope</Hoverable>,
          key: 'Scope',
          render: (lang) => lang.scope,
        },
        CodeColumn,
        NameColumn,
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
