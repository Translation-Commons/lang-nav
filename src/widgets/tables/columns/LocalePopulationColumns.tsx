import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import CensusCountForLocale from '@entities/census/CensusCountForLocale';
import { getObjectPopulation } from '@entities/lib/getObjectPopulation';
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
    render: (ent) => <LocalePopulationAdjusted locale={ent} focus={PopulationFocus.Overall} />,
    exportValue: (ent) => getObjectPopulation(ent),
    field: Field.Population,
    columnGroup: 'Demographics',
    isInitiallyVisible: false,
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
    render: (ent) => <LocalePopulationAdjusted locale={ent} focus={PopulationFocus.Speaking} />,
    exportValue: (ent) => ent.pop.speaking.adjusted,
    field: Field.PopulationSpeaking,
    columnGroup: 'Demographics',
    isInitiallyVisible: (params) => params.populationFocus !== PopulationFocus.Writing,
  },
  {
    key: 'Population (Direct)',
    description: 'This is the original population number cited from sourced data.',
    render: (ent) => ent.pop.speaking.unadjusted,
    field: Field.PopulationDirectlySourced,
    columnGroup: 'Demographics',
    isInitiallyVisible: false,
  },
  {
    key: '% in Territory',
    render: (ent) => ent.pop.speaking.percentAdjusted,
    field: Field.PercentOfTerritoryPopulation,
    columnGroup: 'Demographics',
    isInitiallyVisible: (params) => params.populationFocus !== PopulationFocus.Writing,
  },
  {
    key: '% of Global Language Speakers',
    render: (ent) =>
      ent.pop.speaking.adjusted &&
      (ent.pop.speaking.adjusted * 100) / (ent.language?.pop.speaking.estimate ?? 1),
    isInitiallyVisible: false,
    field: Field.PercentOfOverallLanguageSpeakers,
    columnGroup: 'Demographics',
  },
  {
    key: 'Population Source',
    render: (ent) => <LocaleCensusCitation locale={ent} focus={PopulationFocus.Speaking} />,
    field: Field.SourceForPopulation,
    columnGroup: 'Demographics',
    isInitiallyVisible: (params) => params.populationFocus !== PopulationFocus.Writing,
  },
  {
    key: 'Population Records',
    render: (ent) => <CensusCountForLocale locale={ent} />,
    columnGroup: 'Demographics',
    field: Field.CountOfCensuses,
    isInitiallyVisible: false,
  },
];
