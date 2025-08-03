import { TriangleAlertIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

import { getUniqueTerritoriesForLanguage } from '../../controls/sort';
import { useDataContext } from '../../data/DataContext';
import Hoverable from '../../generic/Hoverable';
import HoverableEnumeration from '../../generic/HoverableEnumeration';
import { LanguageData, LanguageField } from '../../types/LanguageTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CLDRCoverageText, ICUSupportStatus } from '../common/CLDRCoverageInfo';
import HoverableObjectName from '../common/HoverableObjectName';
import PopulationWarning from '../common/PopulationWarning';
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
  const codeColumn = {
    ...CodeColumn,
    render: (lang: LanguageData): ReactNode => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {lang.codeDisplay}
        {lang.warnings && lang.warnings[LanguageField.isoCode] && (
          <Hoverable
            hoverContent={lang.warnings[LanguageField.isoCode]}
            style={{ marginLeft: '0.125em' }}
          >
            <TriangleAlertIcon size="1em" display="block" color="var(--color-text-yellow)" />
          </Hoverable>
        )}
      </div>
    ),
  };

  return (
    <ObjectTable<LanguageData>
      objects={Object.values(languages)}
      columns={[
        codeColumn,
        NameColumn,
        endonymColumn,
        {
          key: 'Scope',
          render: (lang) => lang.scope ?? lang.scope,
          isInitiallyVisible: false,
        },
        {
          label: (
            <>
              Population
              <PopulationWarning />
            </>
          ),
          key: 'Population',
          render: (lang) => lang.populationCited,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: 'CLDR Coverage',
          label: 'CLDR Coverage',
          render: (lang) => <CLDRCoverageText object={lang} />,
          isInitiallyVisible: false,
        },
        {
          key: 'ICU Support',
          label: 'ICU Support',
          render: (lang) => <ICUSupportStatus object={lang} />,
          isInitiallyVisible: false,
        },
        {
          key: 'Parent Language',
          render: (lang) =>
            lang.parentLanguage && <HoverableObjectName object={lang.parentLanguage} />,
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
          isNumeric: true,
          isInitiallyVisible: false,
          sortParam: SortBy.CountOfLanguages,
        },
        {
          key: 'Territories',
          render: (lang) => <HoverableEnumeration items={getUniqueTerritoriesForLanguage(lang)} />,
          isNumeric: true,
          sortParam: SortBy.CountOfTerritories,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default LanguageTable;
