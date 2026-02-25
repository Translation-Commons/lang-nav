import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';

import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { LangFormedHereFieldDescription } from '@entities/locale/localstatus/LocaleFormedHereDisplay';
import { HistoricPresenceFieldDescription } from '@entities/locale/localstatus/LocaleHistoricPresenceDisplay';

import CountOfPeople from '@shared/ui/CountOfPeople';

import { getLanguagesBiggestCountryLocale } from './LocaleIndigeneityPredictions';
import {
  HistoricPresencePredictionToggle,
  LocaleFormedHerePredictionToggle,
} from './LocaleIndigeneityPredictionToggle';

const LocaleIndigeneityTable: React.FC<{
  locales: LocaleData[];
  addToChangedLocales: (locale: LocaleData) => void;
}> = ({ locales, addToChangedLocales }) => {
  return (
    <InteractiveObjectTable
      tableID={TableID.LocaleIndigeneity}
      objects={locales}
      columns={[
        {
          key: 'ID',
          render: (locale) => <HoverableObjectName object={locale} labelSource="code" />,
          field: Field.Code,
          columnGroup: 'Identity',
        },
        { ...NameColumn, isInitiallyVisible: false, columnGroup: 'Identity' },
        {
          key: 'Language',
          render: (locale) => <HoverableObjectName object={locale.language} />,
          field: Field.Language,
          columnGroup: 'Identity',
        },
        {
          key: 'Territory',
          render: (locale) => <HoverableObjectName object={locale.territory} />,
          field: Field.Territory,
          columnGroup: 'Identity',
        },
        {
          key: 'Population',
          render: (locale) => <CountOfPeople count={locale.populationAdjusted} />,
          field: Field.Population,
          isInitiallyVisible: false,
        },
        {
          key: '% of Worldwide Population',
          render: (locale) =>
            ((locale.populationAdjusted ?? 0) * 100) / (locale.language?.populationEstimate || 1),
          valueType: TableValueType.Decimal,
          isInitiallyVisible: false,
          columnGroup: 'Population',
        },
        {
          key: 'Language Biggest Territory',
          render: (locale) => {
            const biggestLocale = getLanguagesBiggestCountryLocale(locale.language);
            return (
              <HoverableObjectName
                object={biggestLocale}
                labelSource="territory"
                style={{
                  color:
                    biggestLocale?.territoryCode === locale.territoryCode
                      ? 'var(--color-text-secondary)'
                      : undefined,
                }}
              />
            );
          },
          isInitiallyVisible: false,
          columnGroup: 'Population',
        },
        {
          key: 'Pop of Language Biggest Territory',
          render: (locale) => (
            <CountOfPeople
              count={getLanguagesBiggestCountryLocale(locale.language)?.populationAdjusted}
            />
          ),
          valueType: TableValueType.Population,
          isInitiallyVisible: false,
          columnGroup: 'Population',
        },
        {
          key: 'Official Status',
          render: (locale) =>
            locale.officialStatus ? getOfficialLabel(locale.officialStatus) : '',
          columnGroup: 'Status',
        },
        {
          key: 'Formation (Predicted)',
          description: <LangFormedHereFieldDescription />,
          render: (locale) => (
            <LocaleFormedHerePredictionToggle
              loc={locale}
              addToChangedLocales={addToChangedLocales}
            />
          ),
          field: Field.LanguageFormedHere,
          columnGroup: 'Status',
        },
        {
          key: 'Historic Presence (Predicted)',
          description: <HistoricPresenceFieldDescription />,
          render: (locale) => (
            <HistoricPresencePredictionToggle
              loc={locale}
              addToChangedLocales={addToChangedLocales}
            />
          ),
          field: Field.HistoricPresence,
          columnGroup: 'Status',
        },
      ]}
    />
  );
};

export default LocaleIndigeneityTable;
