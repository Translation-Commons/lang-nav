import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import { getCldrLocale } from '../../data/cldrLocales';
import { useDataContext } from '../../data/DataContext';
import CommaSeparated from '../../generic/CommaSeparated';
import { numberToFixedUnlessSmall } from '../../generic/numberUtils';
import { toSentenceCase } from '../../generic/stringUtils';
import { LocaleData } from '../../types/DataTypes';
import { SortBy } from '../../types/SortTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import ObjectWikipediaInfo from '../common/ObjectWikipediaInfo';
import PopulationWarning from '../common/PopulationWarning';
import { CodeColumn, EndonymColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

import LocaleCensusCitation from './LocaleCensusCitation';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();
  const { languageSource } = usePageParams();

  return (
    <ObjectTable<LocaleData>
      objects={locales.filter(
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
          columnGroup: 'Demographics',
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
          columnGroup: 'Demographics',
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
          sortParam: SortBy.PercentOfTerritoryPopulation,
          columnGroup: 'Demographics',
        },
        {
          key: '% of Global Language Speakers',
          render: (object) =>
            object.populationSpeaking &&
            numberToFixedUnlessSmall(
              (object.populationSpeaking * 100) / (object.language?.populationEstimate ?? 1),
            ),
          isNumeric: true,
          isInitiallyVisible: false,
          sortParam: SortBy.PercentOfOverallLanguageSpeakers,
          columnGroup: 'Demographics',
        },
        {
          key: 'Population Source',
          render: (object) => <LocaleCensusCitation locale={object} size="short" />,
          columnGroup: 'Demographics',
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
          columnGroup: 'Linked Data',
        },
        {
          key: 'Language',
          render: (object) => <HoverableObjectName object={object.language} />,
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
          sortParam: SortBy.Language,
        },
        {
          key: 'Territory',
          render: (object) => <HoverableObjectName object={object.territory} />,
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
        },
        {
          key: 'Writing System',
          render: (object) => <HoverableObjectName object={object.writingSystem} />,
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
        },
        {
          key: 'Variant Tags',
          render: (object) =>
            object.variantTags && (
              <CommaSeparated limit={1}>
                {object.variantTags.map((vt) => (
                  <HoverableObjectName object={vt} key={vt.ID} />
                ))}
              </CommaSeparated>
            ),
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
        },
        {
          key: 'Wikipedia',
          render: (object) => <ObjectWikipediaInfo object={object} size="compact" />,
          isInitiallyVisible: false,
        },
        {
          key: 'Locale Source',
          render: (object) => toSentenceCase(object.localeSource),
          isInitiallyVisible: false,
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
