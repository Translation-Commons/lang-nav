import React from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import {
  getRetirementReasonLabel,
  RetirementReason,
} from '@features/data-loading/iso/ISORetirements';
import Hoverable from '@features/hovercard/Hoverable';
import HoverableEnumeration from '@features/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { SortBy } from '@features/sorting/SortTypes';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableValueType from '@features/table/TableValueType';

import LanguageRetirementReason from '@entities/language/LanguageRetirementReason';
import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageWritingSystems from '@entities/language/LanguageWritingSystems';
import LanguagePluralCategories from '@entities/language/plurals/LanguagePluralCategories';
import LanguagePluralRuleExamplesGrid from '@entities/language/plurals/LanguagePluralGrid';
import {
  getObjectLiteracy,
  getUniqueCountriesForLanguage,
} from '@entities/lib/getObjectMiscFields';

import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageCodeColumns } from './columns/LanguageCodeColumns';
import { LanguageDigitalSupportColumns } from './columns/LanguageDigitalSupportColumns';
import { LanguageNameColumns } from './columns/LanguageNameColumns';
import { LanguagePopulationColumns } from './columns/LanguagePopulationColumns';
import { LanguageVitalityColumns } from './columns/LanguageVitalityColumns';

const LanguageTable: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();

  return (
    <InteractiveObjectTable<LanguageData>
      objects={languagesInSelectedSource}
      columns={[
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
            let retirementReason = lang.retirementReason ?? undefined;
            if (!retirementReason && lang.sourceSpecific.ISO.code == null) {
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
        {
          key: 'Writing Systems',
          description: (
            <>
              The writing systems used to write this language. The possible values come from ISO
              15924, which include some combined systems like <code>Hani</code> including all
              Chinese Characters, including Simplified <code>Hans</code> or Traditional{' '}
              <code>Hant</code>.
            </>
          ),
          render: (lang) => <LanguageWritingSystems lang={lang} />,
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
            <HoverableEnumeration
              items={getUniqueCountriesForLanguage(lang).map((territory) => territory.nameDisplay)}
            />
          ),
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
          columnGroup: 'Vitality',
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
      ]}
    />
  );
};

export default LanguageTable;
