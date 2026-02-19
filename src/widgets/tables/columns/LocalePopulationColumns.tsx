import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import CensusCountForLocale from '@entities/census/CensusCountForLocale';
import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import LocalePopulationAdjusted from '@entities/locale/LocalePopulationAdjusted';
import { LocaleData } from '@entities/types/DataTypes';

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
    field: Field.Population,
    columnGroup: 'Demographics',
  },
  {
    key: 'Population (Direct)',
    description: 'This is the original population number cited from sourced data.',
    render: (object) => object.populationSpeaking,
    field: Field.PopulationDirectlySourced,
    columnGroup: 'Demographics',
    isInitiallyVisible: false,
  },
  {
    key: '% in Territory',
    render: (object) => object.populationSpeakingPercent,
    field: Field.PercentOfTerritoryPopulation,
    columnGroup: 'Demographics',
  },
  {
    key: '% of Global Language Speakers',
    render: (object) =>
      object.populationSpeaking &&
      (object.populationSpeaking * 100) / (object.language?.populationEstimate ?? 1),
    isInitiallyVisible: false,
    field: Field.PercentOfOverallLanguageSpeakers,
    columnGroup: 'Demographics',
  },
  {
    key: 'Population Source',
    render: (object) => <LocaleCensusCitation locale={object} size="short" />,
    columnGroup: 'Demographics',
  },
  {
    key: 'Population Records',
    render: (object) => <CensusCountForLocale locale={object} />,
    columnGroup: 'Demographics',
    field: Field.CountOfCensuses,
    isInitiallyVisible: false,
  },
];
