import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import CensusCountForLocale from '@entities/census/CensusCountForLocale';
import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import LocalePopulationAdjusted from '@entities/locale/LocalePopulationAdjusted';
import { LocaleData } from '@entities/locale/LocaleTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

export const LocalePopulationColumns: TableColumn<LocaleData>[] = [
  {
    key: 'Population (Adjusted)',
    description: (
      <>
        This shows the number of people who speak or write the language (the max of the 2
        estimates), adjusted. Most population records become outdated over time. In order to figure
        out the current population, we take the percent of the territory population that spoke the
        language at the time of the census and multiply it by the current population of the
        territory.
      </>
    ),
    render: (object) => (
      <LocalePopulationAdjusted locale={object} focus={PopulationFocus.Overall} />
    ),
    exportValue: (object) => object.pop.speaking.adjusted,
    field: Field.Population,
    columnGroup: 'Demographics',
  },
  {
    key: 'Population (Speaking)',
    description: (
      <>
        This shows the number of people who speak the language, adjusted. Most population records
        become outdated over time. In order to figure out the current population, we take the
        percent of the territory population that spoke the language at the time of the census and
        multiply it by the current population of the territory.
      </>
    ),
    render: (object) => (
      <LocalePopulationAdjusted locale={object} focus={PopulationFocus.Speaking} />
    ),
    exportValue: (object) => object.pop.speaking.adjusted,
    field: Field.PopulationSpeaking,
    columnGroup: 'Demographics',
  },
  {
    key: 'Population (Direct)',
    description: 'This is the original population number cited from sourced data.',
    render: (object) => object.pop.speaking.unadjusted,
    field: Field.PopulationDirectlySourced,
    columnGroup: 'Demographics',
    isInitiallyVisible: false,
  },
  {
    key: '% in Territory',
    render: (object) => object.pop.speaking.percentAdjusted,
    field: Field.PercentOfTerritoryPopulation,
    columnGroup: 'Demographics',
  },
  {
    key: '% of Global Language Speakers',
    render: (object) =>
      object.pop.speaking.adjusted &&
      (object.pop.speaking.adjusted * 100) / (object.language?.pop.speaking.estimate ?? 1),
    isInitiallyVisible: false,
    field: Field.PercentOfOverallLanguageSpeakers,
    columnGroup: 'Demographics',
  },
  {
    key: 'Population Source',
    render: (object) => <LocaleCensusCitation locale={object} focus={PopulationFocus.Speaking} />,
    field: Field.SourceForPopulation,
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
