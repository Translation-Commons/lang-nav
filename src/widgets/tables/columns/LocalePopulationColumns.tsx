import { SortBy } from '@features/sorting/SortTypes';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';

import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import { LocalePopulationAdjusted } from '@entities/locale/LocalePopulationAdjusted';
import { LocaleData } from '@entities/types/DataTypes';

import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';

export const LocalePopulationColumns: TableColumn<LocaleData>[] = [
  {
    key: 'Population (Adjusted)',
    description: (
      <>
        Most population records become outdated over time. In order to figure out the current
        population, we take the percent of the territory population that spoke the language at the
        time of the census and multiply it by the current population of the territory.
      </>
    ),
    render: (object) => <LocalePopulationAdjusted locale={object} />,
    valueType: TableValueType.Numeric,
    sortParam: SortBy.Population,
    columnGroup: 'Demographics',
  },
  {
    key: 'Population (Direct)',
    description: 'This is the original population number cited from sourced data.',
    render: (object) => object.populationSpeaking,
    valueType: TableValueType.Numeric,
    sortParam: SortBy.PopulationAttested,
    columnGroup: 'Demographics',
    isInitiallyVisible: false,
  },
  {
    key: '% in Territory',
    render: (object) =>
      object.populationSpeakingPercent && (
        <>
          {numberToFixedUnlessSmall(object.populationSpeakingPercent)}
          {/* If the number is greater than 10%, add an invisible 0 for alignment */}
          {object.populationSpeakingPercent > 10 && <span style={{ visibility: 'hidden' }}>0</span>}
        </>
      ),
    valueType: TableValueType.Numeric,
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
    valueType: TableValueType.Numeric,
    isInitiallyVisible: false,
    sortParam: SortBy.PercentOfOverallLanguageSpeakers,
    columnGroup: 'Demographics',
  },
  {
    key: 'Population Source',
    render: (object) => <LocaleCensusCitation locale={object} size="short" />,
    columnGroup: 'Demographics',
  },
];
