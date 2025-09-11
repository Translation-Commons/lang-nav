import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import { getCldrLocale } from '../../data/cldrLocales';
import { useDataContext } from '../../data/DataContext';
import CommaSeparated from '../../generic/CommaSeparated';
import { numberToFixedUnlessSmall } from '../../generic/numberUtils';
import { LocaleData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import PopulationWarning from '../common/PopulationWarning';
import { CodeColumn, EndonymColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

import LocaleCensusCitation from './LocaleCensusCitation';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();
  const { languageSource } = usePageParams();

  return (
    <ObjectTable<LocaleData>
      objects={Object.values(locales).filter(
        (locale) => locale.language?.sourceSpecific[languageSource].code != null,
      )}
      columns={[
        CodeColumn,
        NameColumn,
        EndonymColumn,
        {
          label: (
            <>
              Population
              <PopulationWarning />
            </>
          ),
          key: 'Population',
          render: (object) => object.populationSpeaking,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: 'Literacy',
          render: (object) =>
            object.literacyPercent != null
              ? numberToFixedUnlessSmall(object.literacyPercent)
              : null,
          isInitiallyVisible: false,
          isNumeric: true,
          sortParam: SortBy.Literacy,
        },
        {
          key: '% in Territory',
          render: (object) =>
            object.populationSpeakingPercent && (
              <>
                {numberToFixedUnlessSmall(object.populationSpeakingPercent)}
                {object.populationSpeakingPercent > 10 && (
                  <span style={{ visibility: 'hidden' }}>0</span>
                )}
              </>
            ),
          isNumeric: true,
          sortParam: SortBy.RelativePopulation,
        },
        {
          key: 'Population Source',
          render: (object) => <LocaleCensusCitation locale={object} size="short" />,
        },
        {
          key: 'Contained Locales',
          render: (loc) => (
            <CommaSeparated limit={2}>
              {loc.containedLocales?.map((child) => (
                <HoverableObjectName object={child} key={child.ID} />
              ))}
            </CommaSeparated>
          ),
          isInitiallyVisible: false,
          isNumeric: true,
          sortParam: SortBy.CountOfLanguages,
        },

        // ------- CLDR columns (hidden by default) -------
        {
          key: 'CLDR Tier',
          label: 'CLDR Tier',
          render: (loc: LocaleData) => {
            const cldr = getCldrLocale(loc.ID);
            return cldr ? cldr.tier : null;
          },
          isInitiallyVisible: false,
        },
        {
          key: 'CLDR Level',
          label: 'CLDR Level',
          render: (loc: LocaleData) => {
            const cldr = getCldrLocale(loc.ID);
            return cldr ? (
              <span>
                {cldr.targetLevel ?? '—'} / {cldr.computedLevel ?? '—'}
              </span>
            ) : null;
          },
          isInitiallyVisible: false,
        },
        {
          key: 'CLDR Confirmed %',
          label: 'Confirmed %',
          render: (loc: LocaleData) => {
            const cldr = getCldrLocale(loc.ID);
            return cldr?.confirmedPct != null ? cldr.confirmedPct : null;
          },
          isInitiallyVisible: false,
          isNumeric: true,
        },
        {
          key: 'CLDR ICU',
          label: 'ICU',
          render: (loc: LocaleData) => {
            const cldr = getCldrLocale(loc.ID);
            return cldr?.icuIncluded ? '✓' : '—';
          },
          isInitiallyVisible: false,
        },
        {
          key: 'CLDR Default',
          label: 'Default Locale',
          render: (loc: LocaleData) => {
            const cldr = getCldrLocale(loc.ID);
            return cldr?.localeIsDefaultForLanguage ? '★' : '—';
          },
          isInitiallyVisible: false,
        },
      ]}
    />
  );
};

export default LocaleTable;
