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
import LanguagePopulationFromLocales from '@entities/language/population/LanguagePopulationFromLocales';
import LanguagePopulationInSelectedTerritory from '@entities/language/population/LanguagePopulationInSelectedTerritory';
import LanguagePopulationKnownWarning from '@entities/language/population/LanguagePopulationKnownWarning';
import LanguagePopulationSource from '@entities/language/population/LanguagePopulationSource';

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
    key: 'Population (est.)',
    description: (
      <>
        The overall amount of people that speak, write, or sign this language. This is estimated
        from one of 3 possible sources: inputted data aggregated from language databases, aggregated
        census data and/or aggregated data from dialects.
      </>
    ),
    render: (lang) => <LanguagePopulationEstimate lang={lang} />,
    field: Field.Population,
  },
  {
    key: 'Speakers (est.)',
    description: (
      <>
        The estimated number of people that speak this language. This is estimated from one of 3
        possible sources: inputted data aggregated from language databases, aggregated census data
        and/or aggregated data from dialects.
      </>
    ),
    render: (lang) => (
      <>
        <LanguagePopulationKnownWarning lang={lang} use="speaking" />
        <LanguagePopulationEstimate lang={lang} use="speaking" />
      </>
    ),
    field: Field.PopulationSpeaking,
    isInitiallyVisible: true,
  },
  {
    key: 'Writers (est.)',
    description: (
      <>
        The estimated number of people that write in this language. For many people, this may not be
        their mothertongue (L1), rather their second language (L2). This is estimated from one of 3
        possible sources: inputted data aggregated from language databases, aggregated census data
        and/or aggregated data from dialects.
      </>
    ),
    render: (lang) => (
      <>
        <LanguagePopulationKnownWarning lang={lang} use="writing" />
        <LanguagePopulationEstimate lang={lang} use="writing" />
      </>
    ),
    field: Field.PopulationWriting,
    isInitiallyVisible: true,
  },
  {
    key: 'Best Estimate Source',
    description: 'The source category for the overall population estimate.',
    render: (lang) => <LanguagePopulationSource lang={lang} />,
  },
  {
    key: 'Population (Rough)',
    labelInColumnGroup: '... rough estimate',
    description:
      'This is a rough estimate from variable internet databases (citations not available).',
    render: (lang) => lang.pop.rough,
    field: Field.PopulationDirectlySourced,
  },
  {
    key: 'Population (from Dialects)',
    labelInColumnGroup: '... from Dialects',
    description:
      'Some of these languages may have data from constituent dialects/locales. They have been added up here.',
    render: (lang) => <LanguagePopulationFromDescendants lang={lang} use="speaking" />,
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
    render: (lang) => <LanguagePopulationFromLocales lang={lang} use="speaking" />,
    valueType: TableValueType.Population,
  },
  {
    key: 'Population (in Territory)',
    label: <PopulationInTerritoryLabel />,
    labelInColumnGroup: <PopulationInTerritoryLabel isShortened={true} />,
    description: <PopulationInTerritoryDescription />,
    render: (lang) => <LanguagePopulationInSelectedTerritory lang={lang} />,
    isInitiallyVisible: (params) =>
      !!params.territoryFilter.match(/(^[A-Za-z]{2}$)|(\W[A-Z]{2}\W)/),
    valueType: TableValueType.Population,
  },
];

export default LanguagePopulationColumns.map((col) => ({
  ...col,
  isInitiallyVisible: col.isInitiallyVisible ?? false,
  columnGroup: 'Population',
}));
