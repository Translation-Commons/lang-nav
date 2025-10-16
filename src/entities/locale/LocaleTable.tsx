import React from 'react';

import { usePageParams } from '@widgets/PageParamsProvider';
import PopulationWarning from '@widgets/PopulationWarning';

import { useDataContext } from '@features/data-loading/DataContext';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';

import { LocaleData } from '@entities/types/DataTypes';
import HoverableObjectName from '@entities/ui/HoverableObjectName';

import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import { toSentenceCase } from '@shared/lib/stringUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';

import ObjectWikipediaInfo from '../ui/ObjectWikipediaInfo';

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
                {/* If the number is greater than 10%, add an invisible 0 for alignment */}
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
      ]}
    />
  );
};

export default LocaleTable;
