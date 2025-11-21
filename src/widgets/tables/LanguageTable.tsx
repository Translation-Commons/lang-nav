import React, { useMemo } from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import {
  getRetirementReasonLabel,
  RetirementReason,
} from '@features/data-loading/iso/ISORetirements';
import Hoverable from '@features/hovercard/Hoverable';
import HoverableEnumeration from '@features/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableColumn from '@features/table/TableColumn';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import LanguageRetirementReason from '@entities/language/LanguageRetirementReason';
import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageWritingSystems from '@entities/language/LanguageWritingSystems';
import LanguagePluralCategories from '@entities/language/plurals/LanguagePluralCategories';
import LanguagePluralRuleExamplesGrid from '@entities/language/plurals/LanguagePluralGrid';
import {
  getObjectLiteracy,
  getUniqueCountriesForLanguage,
} from '@entities/lib/getObjectMiscFields';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageCodeColumns } from './columns/LanguageCodeColumns';
import { LanguageDigitalSupportColumns } from './columns/LanguageDigitalSupportColumns';
import { LanguageNameColumns } from './columns/LanguageNameColumns';
import { LanguagePopulationColumns } from './columns/LanguagePopulationColumns';
import { LanguageVitalityColumns } from './columns/LanguageVitalityColumns';

const LanguageTable: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();

  const columns: TableColumn<LanguageData>[] = useMemo(() => {
    return [
      ...LanguageCodeColumns,
      ...LanguageNameColumns,
      {
        key: 'Scope',
        render: (lang) => lang.scope,
        isInitiallyVisible: false,
        columnGroup: 'Context',
      },
      {
        key: 'ISO Retirement',
        render: (lang) => {
          let retirementReason = lang.ISO.retirementReason ?? undefined;
          if (!retirementReason && lang.ISO.code == null) {
            retirementReason = RetirementReason.NeverISO;
          }
          return retirementReason ? (
            <Hoverable hoverContent={<LanguageRetirementReason lang={lang} />}>
              {getRetirementReasonLabel(retirementReason)}
            </Hoverable>
          ) : (
            <Deemphasized>n/a</Deemphasized>
          );
        },
        isInitiallyVisible: false,
        columnGroup: 'Context',
      },
      {
        key: 'Modality',
        render: (lang) => lang.modality ?? <Deemphasized>—</Deemphasized>,
        isInitiallyVisible: false,
        columnGroup: 'Context',
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
        key: 'Countries',
        render: (lang) => (
          <CommaSeparated limit={1} limitText="short">
            {getUniqueCountriesForLanguage(lang).map((territory) => (
              <HoverableObjectName object={territory} key={territory.ID} />
            ))}
          </CommaSeparated>
        ),
        sortParam: SortBy.Territory,
        columnGroup: 'Location',
      },
      {
        key: 'Country Count',
        render: (lang) => (
          <HoverableEnumeration
            items={getUniqueCountriesForLanguage(lang).map((territory) => territory.nameDisplay)}
          />
        ),
        isInitiallyVisible: false,
        valueType: TableValueType.Numeric,
        sortParam: SortBy.CountOfTerritories,
        columnGroup: 'Location',
      },
      {
        key: 'Latitude',
        render: (lang) => lang.latitude?.toFixed(2) ?? <Deemphasized>—</Deemphasized>,
        exportValue: (lang) => lang.latitude?.toFixed(4) ?? '',
        isInitiallyVisible: false,
        sortParam: SortBy.Latitude,
        valueType: TableValueType.Numeric,
        columnGroup: 'Location',
      },
      {
        key: 'Longitude',
        render: (lang) => lang.longitude?.toFixed(2) ?? <Deemphasized>—</Deemphasized>,
        exportValue: (lang) => lang.longitude?.toFixed(4) ?? '',
        isInitiallyVisible: false,
        sortParam: SortBy.Longitude,
        valueType: TableValueType.Numeric,
        columnGroup: 'Location',
      },
      {
        key: 'Writing Systems',
        description: (
          <>
            The writing systems used to write this language. The possible values come from ISO
            15924, which include some combined systems like <code>Hani</code> including all Chinese
            Characters, including Simplified <code>Hans</code> or Traditional <code>Hant</code>.
          </>
        ),
        render: (lang) => <LanguageWritingSystems lang={lang} />,
        isInitiallyVisible: false,
        sortParam: SortBy.WritingSystem,
        columnGroup: 'Writing',
      },
      {
        key: 'Literacy',
        render: (lang) => {
          const literacy = getObjectLiteracy(lang);
          if (literacy == null) return <Deemphasized>—</Deemphasized>;
          return literacy.toFixed(1);
        },
        exportValue: (lang) => getObjectLiteracy(lang)?.toFixed(1),
        isInitiallyVisible: false,
        sortParam: SortBy.Literacy,
        valueType: TableValueType.Numeric,
        columnGroup: 'Writing',
      },
      {
        key: 'Plural rules',
        render: (lang) => <LanguagePluralCategories lang={lang} />,
        isInitiallyVisible: false,
        columnGroup: 'Grammar',
      },
      {
        key: 'Plural rule examples',
        render: (lang) => <LanguagePluralRuleExamplesGrid lang={lang} />,
        isInitiallyVisible: false,
        columnGroup: 'Grammar',
      },
    ];
  }, []);

  return (
    <InteractiveObjectTable<LanguageData>
      tableID={TableID.Languages}
      objects={languagesInSelectedSource}
      columns={columns}
    />
  );
};

export default LanguageTable;
