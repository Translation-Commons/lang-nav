import { TriangleAlertIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';
import TableValueType from '@features/table/TableValueType';

import { LanguageData, LanguageField } from '@entities/language/LanguageTypes';
import {
  getObjectLiteracy,
  getUniqueTerritoriesForLanguage,
} from '@entities/lib/getObjectMiscFields';
import HoverableObjectName from '@entities/ui/HoverableObjectName';

import Deemphasized from '@shared/ui/Deemphasized';
import Hoverable from '@shared/ui/Hoverable';
import HoverableEnumeration from '@shared/ui/HoverableEnumeration';

import { LanguageDigitalSupportColumns } from './columns/LanguageDigitalSupportColumns';
import { LanguagePopulationColumns } from './columns/LanguagePopulationColumns';
import { LanguageVitalityColumns } from './columns/LanguageVitalityColumns';

const LanguageTable: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();
  const endonymColumn = { ...EndonymColumn, isInitiallyVisible: true };
  const codeColumn = {
    ...CodeColumn,
    render: (lang: LanguageData): ReactNode => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {lang.codeDisplay}
        {<MaybeISOWarning lang={lang} />}
      </div>
    ),
  };

  return (
    <ObjectTable<LanguageData>
      objects={languagesInSelectedSource}
      columns={[
        codeColumn,
        {
          key: 'ISO 639-3',
          render: (lang) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {lang.sourceSpecific.ISO.code}
              {<MaybeISOWarning lang={lang} />}
            </div>
          ),
          isInitiallyVisible: false,
          columnGroup: 'Codes',
        },
        {
          key: 'Glottocode',
          render: (lang) => lang.sourceSpecific.Glottolog.code,
          isInitiallyVisible: false,
          columnGroup: 'Codes',
        },
        NameColumn,
        endonymColumn,
        {
          key: 'Scope',
          render: (lang) => lang.scope,
          isInitiallyVisible: false,
        },
        ...LanguagePopulationColumns,
        ...LanguageVitalityColumns,
        ...LanguageDigitalSupportColumns,
        {
          key: 'Parent Language',
          render: (lang) =>
            lang.parentLanguage && <HoverableObjectName object={lang.parentLanguage} />,
          isInitiallyVisible: false,
          columnGroup: 'Relations',
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
          valueType: TableValueType.Numeric,
          isInitiallyVisible: false,
          sortParam: SortBy.CountOfLanguages,
          columnGroup: 'Relations',
        },
        {
          key: 'Territories',
          render: (lang) => (
            <HoverableEnumeration
              items={getUniqueTerritoriesForLanguage(lang).map(
                (territory) => territory.nameDisplay,
              )}
            />
          ),
          valueType: TableValueType.Numeric,
          sortParam: SortBy.CountOfTerritories,
          columnGroup: 'Relations',
        },
        {
          key: 'Literacy',
          render: (lang) => {
            const literacy = getObjectLiteracy(lang);
            if (literacy == null) return <Deemphasized>—</Deemphasized>;
            return literacy.toFixed(1);
          },
          isInitiallyVisible: false,
          sortParam: SortBy.Literacy,
          valueType: TableValueType.Numeric,
        },
      ]}
    />
  );
};

function MaybeISOWarning({ lang }: { lang: LanguageData }): React.ReactNode | null {
  return lang.warnings && lang.warnings[LanguageField.isoCode] ? (
    <Hoverable
      hoverContent={lang.warnings[LanguageField.isoCode]}
      style={{ marginLeft: '0.125em' }}
    >
      <TriangleAlertIcon size="1em" display="block" color="var(--color-text-yellow)" />
    </Hoverable>
  ) : null;
}

export default LanguageTable;
