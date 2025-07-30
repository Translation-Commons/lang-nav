import React from 'react';

import { getUniqueTerritoriesForLanguage } from '../../controls/sort';
import { useDataContext } from '../../data/DataContext';
import HoverableEnumeration from '../../generic/HoverableEnumeration';
import { LanguageData } from '../../types/LanguageTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CLDRCoverageInfo } from '../common/CLDRCoverageInfo';
import {
  CodeColumn,
  EndonymColumn,
  InfoButtonColumn,
  NameColumn,
} from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const LanguageTable: React.FC = () => {
  const { languages } = useDataContext();
  const endonymColumn = { ...EndonymColumn, isInitiallyVisible: true };

  return (
    <ObjectTable<LanguageData>
      objects={Object.values(languages)}
      columns={[
        CodeColumn,
        NameColumn,
        endonymColumn,
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
          key: 'Internet Technologies',
          render: (lang) => <CLDRCoverageInfo object={lang} />,
          isInitiallyVisible: false,
        },
        {
          key: 'Dialects',
          render: (lang) => (
            <HoverableEnumeration
              items={lang.childLanguages
                .sort((a, b) => (b.populationCited ?? 0) - (a.populationCited ?? 0))
                .map((lang) => lang.nameDisplay)}
            />
          ),
          isInitiallyVisible: false,
          sortParam: SortBy.CountOfLanguages,
        },
        {
          key: 'Territories',
          render: (lang) => <HoverableEnumeration items={getUniqueTerritoriesForLanguage(lang)} />,
          sortParam: SortBy.CountOfTerritories,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default LanguageTable;
