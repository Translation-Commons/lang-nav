import { SortBy } from '@features/sorting/SortTypes';
import { TableColumn, ValueType } from '@features/table/ObjectTable';

import { LanguagePopulationEstimate } from '@entities/language/LanguagePopulationEstimate';
import LanguagePopulationFromDescendents from '@entities/language/LanguagePopulationFromDescendents';
import LanguagePopulationFromLocales from '@entities/language/LanguagePopulationFromLocales';
import { LanguageData } from '@entities/language/LanguageTypes';

export const LanguagePopulationColumns: TableColumn<LanguageData>[] = [
  {
    key: 'Population',
    description: (
      <>
        The number of people that use this language (probably speak). This is estimated from one of
        3 possible sources: inputted data aggregated from language databases, aggregated census data
        and/or aggregated data from dialects. Click on the language&apos;s name to see more details.
      </>
    ),
    render: (lang) => <LanguagePopulationEstimate lang={lang} />,
    valueType: ValueType.Numeric,
    sortParam: SortBy.Population,
    columnGroup: 'Population',
  },
  {
    key: 'Population (Direct)',
    description: 'This comes from other language databases (citations still needed).',
    render: (lang) => lang.populationCited,
    valueType: ValueType.Numeric,
    isInitiallyVisible: false,
    sortParam: SortBy.PopulationAttested,
    columnGroup: 'Population',
  },
  {
    key: 'Population (from Dialects)',
    description:
      'Some of these languages may have data from constituent dialects/locales. They have been added up here.',
    render: (lang) => <LanguagePopulationFromDescendents lang={lang} />,
    valueType: ValueType.Numeric,
    isInitiallyVisible: false,
    sortParam: SortBy.PopulationOfDescendents,
    columnGroup: 'Population',
  },
  {
    key: 'Population (from Locales)',
    description: (
      <>
        This data comes from adding up the populations of all locales for this language. The
        population from locales have been adjusted to 2025 estimates.
      </>
    ),
    render: (lang) => <LanguagePopulationFromLocales lang={lang} />,
    valueType: ValueType.Numeric,
    isInitiallyVisible: false,
    columnGroup: 'Population',
  },
];
