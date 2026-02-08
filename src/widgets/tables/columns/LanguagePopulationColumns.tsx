import React from 'react';

import TerritoryDataYear from '@features/data/context/TerritoryDataYear';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LanguagePopulationEstimate } from '@entities/language/population/LanguagePopulationEstimate';
import LanguagePopulationFromDescendants from '@entities/language/population/LanguagePopulationFromDescendants';
import LanguagePopulationFromEthnologue from '@entities/language/population/LanguagePopulationFromEthnologue';
import LanguagePopulationFromLocales from '@entities/language/population/LanguagePopulationFromLocales';
import LanguagePopulationInSelectedTerritory from '@entities/language/population/LanguagePopulationInSelectedTerritory';
import PopulationSourceCategoryDisplay from '@entities/ui/PopulationSourceCategoryDisplay';

const PopulationInTerritoryLabel: React.FC<{ isShortened?: boolean }> = ({
  isShortened = false,
}) => {
  const { territoryFilter } = usePageParams();
  if (!territoryFilter)
    return isShortened ? '... in selected Territory' : 'Population (in Territory, unselected)';

  const formattedTerritory = territoryFilter.split('[')[0].trim(); // cuts out the territory code if its included
  return isShortened ? <>... in {formattedTerritory}</> : <>Population (in {formattedTerritory})</>;
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

const LanguagePopulationColumns: TableColumn<LanguageData>[] = [
  {
    key: 'Best Population Estimate',
    labelInColumnGroup: 'Best Estimate',
    description: (
      <>
        The number of people that use this language (probably speak). This is estimated from one of
        3 possible sources: inputted data aggregated from language databases, aggregated census data
        and/or aggregated data from dialects. Click on the language&apos;s name to see more details.
      </>
    ),
    render: (lang) => <LanguagePopulationEstimate lang={lang} />,
    valueType: TableValueType.Population,
    field: Field.Population,
    isInitiallyVisible: true,
  },
  {
    key: 'Best Estimate Source',
    description: 'The source category for the population estimate value.',
    render: (lang) => (
      <PopulationSourceCategoryDisplay sourceCategory={lang.populationEstimateSource} />
    ),
  },
  {
    key: 'Population (Rough)',
    labelInColumnGroup: '... rough estimate',
    description:
      'This is a rough estimate from variable internet databases (citations not available).',
    render: (lang) => lang.populationRough,
    valueType: TableValueType.Population,
    field: Field.PopulationDirectlySourced,
  },
  {
    key: 'Population (from Dialects)',
    labelInColumnGroup: '... from Dialects',
    description:
      'Some of these languages may have data from constituent dialects/locales. They have been added up here.',
    render: (lang) => <LanguagePopulationFromDescendants lang={lang} />,
    valueType: TableValueType.Population,
    field: Field.PopulationOfDescendants,
  },
  {
    key: 'Population (from Locales)',
    labelInColumnGroup: '... from Locales',
    description: (
      <>
        This data comes from adding up the populations of all locales for this language. The
        population from locales have been adjusted to {TerritoryDataYear} estimates.
      </>
    ),
    render: (lang) => <LanguagePopulationFromLocales lang={lang} />,
    valueType: TableValueType.Population,
  },
  {
    key: 'Population (Ethnologue)',
    labelInColumnGroup: '... from Ethnologue',
    description:
      'This is a lower bound estimate from Ethnologue, data from 2025. It may vastly underestimate the actual population.',
    render: (lang) => <LanguagePopulationFromEthnologue lang={lang} />,
    valueType: TableValueType.Population,
  },
  {
    key: 'Population (in Territory)',
    label: <PopulationInTerritoryLabel />,
    labelInColumnGroup: <PopulationInTerritoryLabel isShortened={true} />,
    description: <PopulationInTerritoryDescription />,
    render: (lang) => <LanguagePopulationInSelectedTerritory lang={lang} />,
    valueType: TableValueType.Population,
  },
];

export default LanguagePopulationColumns.map((col) => ({
  ...col,
  isInitiallyVisible: col.isInitiallyVisible ?? false,
  columnGroup: 'Population',
}));
