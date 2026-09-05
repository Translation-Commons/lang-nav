import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';

import { LanguageData } from '@entities/language/LanguageTypes';
import { getEntityPopulationPercentInBiggestDescendantLanguage } from '@entities/lib/getEntityPopulation';

import EnumDropdown from '@shared/ui/EnumDropdown';

const ReportLanguageDescendants: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();

  const [minimumPercentThreshold, setMinimumPercentThreshold] = React.useState(0);
  const [maximumPercentThreshold, setMaximumPercentThreshold] = React.useState(100);

  const filteredLanguages = useMemo(
    () =>
      languagesInSelectedSource.filter((lang) => {
        if (lang.largestDescendant == null || lang.pop.overall == null || lang.pop.overall === 0)
          return false;
        const percent =
          ((lang.largestDescendant?.pop.overall || 0) / (lang.pop.overall || 1)) * 100;
        return percent >= minimumPercentThreshold && percent <= maximumPercentThreshold;
      }),
    [languagesInSelectedSource, minimumPercentThreshold, maximumPercentThreshold],
  );

  return (
    <>
      This report shows, for each language family or group, which of its descendants is the largest
      language by population. This can help identify which languages are the most prominent within a
      family. It may also reveal some problems in the data, especially if the largest descendant has
      more population than is estimated for the language/language family itself.
      <div className="flex gap-4 items-center">
        Minimum % of population
        <EnumDropdown<number>
          options={[0, 25, 50, 75, 90, 95, 99]}
          value={minimumPercentThreshold}
          onChange={(value: number) => setMinimumPercentThreshold(value)}
        />
        Maximum % of population
        <EnumDropdown<number>
          options={[75, 90, 95, 99, 99.5, 99.9, 99.99, 100, 1e6]}
          value={maximumPercentThreshold}
          onChange={(value: number) => setMaximumPercentThreshold(value)}
        />
      </div>
      <InteractiveEntityTable<LanguageData>
        tableID={TableID.LanguagesLargestDescendant}
        columns={[
          CodeColumn,
          NameColumn,
          {
            key: 'Population',
            render: (lang: LanguageData) => lang.pop.overall,
            field: Field.Population,
          },
          {
            key: 'Estimated Population of Descendants',
            render: (lang: LanguageData) => lang.pop.speaking.descendants,
            field: Field.PopulationOfDescendants,
          },
          {
            key: 'Estimated Population of Descendants (Writing)',
            render: (lang: LanguageData) => lang.pop.writing.descendants,
            valueType: TableValueType.Population,
            isInitiallyVisible: false,
          },
          {
            key: 'Largest Descendant',
            render: (lang: LanguageData) =>
              lang.largestDescendant && (
                <>
                  <HoverableEntityName ent={lang.largestDescendant} /> [
                  {lang.largestDescendant.codeDisplay}]
                </>
              ),
          },
          {
            key: 'Descendant Population',
            render: (lang: LanguageData) => lang.largestDescendant?.pop.overall || null,
            valueType: TableValueType.Population,
          },

          {
            key: '% Descendant',
            render: (lang: LanguageData) =>
              getEntityPopulationPercentInBiggestDescendantLanguage(lang),
            field: Field.PopulationPercentInBiggestDescendantLanguage,
          },
        ]}
        ents={filteredLanguages}
      />
    </>
  );
};

export default ReportLanguageDescendants;
