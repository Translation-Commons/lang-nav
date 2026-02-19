import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import {
  getRetirementReasonLabel,
  RetirementReason,
} from '@features/data/load/extra_entities/ISORetirements';
import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableColumn from '@features/table/TableColumn';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import {
  getLanguageRootLanguageFamily,
  getLanguageRootMacrolanguage,
} from '@entities/language/LanguageFamilyUtils';
import { getModalityLabel } from '@entities/language/LanguageModalityDisplay';
import LanguageRetirementReason from '@entities/language/LanguageRetirementReason';
import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageWritingSystems from '@entities/language/LanguageWritingSystems';
import LanguagePluralCategories from '@entities/language/plurals/LanguagePluralCategories';
import LanguagePluralRuleExamplesGrid from '@entities/language/plurals/LanguagePluralGrid';
import { getObjectLiteracy } from '@entities/lib/getObjectMiscFields';
import { getCountriesInObject } from '@entities/lib/getObjectRelatedTerritories';
import ObjectDepthDisplay from '@entities/ui/ObjectDepthDisplay';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import { LanguageCodeColumns } from './columns/LanguageCodeColumns';
import { LanguageDigitalSupportColumns } from './columns/LanguageDigitalSupportColumns';
import LanguageNameColumns from './columns/LanguageNameColumns';
import LanguagePopulationColumns from './columns/LanguagePopulationColumns';
import LanguageVitalityColumns from './columns/LanguageVitalityColumns';

const LanguageTable: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();

  const columns: TableColumn<LanguageData>[] = useMemo(() => {
    return [
      ...LanguageCodeColumns,
      ...LanguageNameColumns,
      {
        key: 'Scope',
        render: (lang) => getLanguageScopeLabel(lang.scope),
        isInitiallyVisible: false,
        field: Field.LanguageScope,
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
        render: (lang) => getModalityLabel(lang.modality) ?? <Deemphasized>—</Deemphasized>,
        exportValue: (lang) => getModalityLabel(lang.modality), // Avoid exporting escaped html like &amp;
        isInitiallyVisible: false,
        valueType: TableValueType.Enum,
        columnGroup: 'Context',
        field: Field.Modality,
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
        key: 'Macrolanguage',
        render: (lang) => <HoverableObjectName object={getLanguageRootMacrolanguage(lang)} />,
        isInitiallyVisible: false,
        columnGroup: 'Relations',
      },
      {
        key: 'Language Family',
        render: (lang) => <HoverableObjectName object={getLanguageRootLanguageFamily(lang)} />,
        isInitiallyVisible: false,
        columnGroup: 'Relations',
      },
      {
        key: 'Dialects',
        render: (lang) => (
          <HoverableEnumeration
            items={lang.childLanguages.sort(sortByPopulation).map((lang) => lang.nameDisplay)}
          />
        ),
        valueType: TableValueType.Count,
        isInitiallyVisible: false,
        field: Field.CountOfLanguages,
        columnGroup: 'Relations',
      },
      {
        key: 'Depth',
        description: 'How deep in a language family tree this language is.',
        render: (lang) => <ObjectDepthDisplay object={lang} />,
        exportValue: (lang) => lang.depth ?? '', // Export as blank instead of "—"
        isInitiallyVisible: false,
        valueType: TableValueType.Count,
        field: Field.Depth,
        columnGroup: 'Relations',
      },
      {
        key: 'Countries',
        render: (lang) => (
          <CommaSeparated limit={1} limitText="short">
            {getCountriesInObject(lang)?.map((territory) => (
              <HoverableObjectName object={territory} key={territory.ID} />
            ))}
          </CommaSeparated>
        ),
        field: Field.Territory,
        columnGroup: 'Location',
      },
      {
        key: 'Country Count',
        render: (lang) => (
          <HoverableEnumeration
            items={getCountriesInObject(lang)?.map((territory) => territory.nameDisplay)}
          />
        ),
        isInitiallyVisible: false,
        valueType: TableValueType.Count,
        field: Field.CountOfCountries,
        columnGroup: 'Location',
      },
      {
        key: 'Latitude',
        render: (lang) => lang.latitude?.toFixed(2),
        isInitiallyVisible: false,
        field: Field.Latitude,
        valueType: TableValueType.Decimal,
        columnGroup: 'Location',
      },
      {
        key: 'Longitude',
        render: (lang) => lang.longitude?.toFixed(2),
        isInitiallyVisible: false,
        field: Field.Longitude,
        valueType: TableValueType.Decimal,
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
        field: Field.WritingSystem,
        columnGroup: 'Writing',
      },
      {
        key: 'Literacy',
        render: (lang) => getObjectLiteracy(lang),
        isInitiallyVisible: false,
        field: Field.Literacy,
        valueType: TableValueType.Decimal,
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
