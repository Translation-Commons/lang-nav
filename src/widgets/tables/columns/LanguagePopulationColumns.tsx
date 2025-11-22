import HoverableButton from '@features/hovercard/HoverableButton';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { LanguagePopulationEstimate } from '@entities/language/LanguagePopulationEstimate';
import LanguagePopulationFromDescendents from '@entities/language/LanguagePopulationFromDescendents';
import LanguagePopulationFromLocales from '@entities/language/LanguagePopulationFromLocales';
import LanguagePopulationInSelectedTerritory from '@entities/language/LanguagePopulationInSelectedTerritory';
import { LanguageData } from '@entities/language/LanguageTypes';

const PopulationInTerritoryLabel: React.FC = () => {
  const { territoryFilter } = usePageParams();
  if (!territoryFilter) return 'Population (in Territory, unselected)';

  const formattedTerritory = territoryFilter.split('[')[0].trim(); // cuts out the territory code if its included
  return <>Population (in {formattedTerritory})</>;
};

const PopulationInTerritoryDescription: React.FC = () => {
  const { territoryFilter, updatePageParams } = usePageParams();
  if (!territoryFilter)
    return 'Select a territory in the filters in the side panel to see population in that territory.';

  const formattedTerritory = territoryFilter.split('[')[0].trim(); // cuts out the territory code if its included
  return (
    <>
      The population of this language in {formattedTerritory}. For more details and sorting, see the{' '}
      <HoverableButton onClick={() => updatePageParams({ objectType: ObjectType.Locale })}>
        Locale Table
      </HoverableButton>
    </>
  );
};

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
    valueType: TableValueType.Numeric,
    sortParam: SortBy.Population,
    columnGroup: 'Population',
  },
  {
    key: 'Population (Direct)',
    description: 'This comes from other language databases (citations still needed).',
    render: (lang) => lang.populationCited,
    valueType: TableValueType.Numeric,
    isInitiallyVisible: false,
    sortParam: SortBy.PopulationAttested,
    columnGroup: 'Population',
  },
  {
    key: 'Population (from Dialects)',
    description:
      'Some of these languages may have data from constituent dialects/locales. They have been added up here.',
    render: (lang) => <LanguagePopulationFromDescendents lang={lang} />,
    valueType: TableValueType.Numeric,
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
    valueType: TableValueType.Numeric,
    isInitiallyVisible: false,
    columnGroup: 'Population',
  },
  {
    key: 'Population (in Territory)',
    label: <PopulationInTerritoryLabel />,
    description: <PopulationInTerritoryDescription />,
    render: (lang) => <LanguagePopulationInSelectedTerritory lang={lang} />,
    valueType: TableValueType.Numeric,
    isInitiallyVisible: false,
    columnGroup: 'Population',
  },
];
