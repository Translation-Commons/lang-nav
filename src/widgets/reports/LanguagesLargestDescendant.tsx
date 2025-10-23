import React, { useMemo } from 'react';

import Selector from '@widgets/controls/components/Selector';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable, { ValueType } from '@features/table/ObjectTable';

import { LanguageData } from '@entities/language/LanguageTypes';
import { getObjectPopulationPercentInBiggestDescendentLanguage } from '@entities/lib/getObjectPopulation';
import HoverableObjectName from '@entities/ui/HoverableObjectName';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';

const LanguagesLargestDescendant: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();

  // TODO move this algorithm earlier in the data processing pipeline so it doesn't need to be
  // recomputed every time the component renders.

  // Clear the largest descendants first since it may change a lot if the schema changes.
  languagesInSelectedSource.forEach((lang) => {
    lang.largestDescendant = undefined;
  });

  // Compute the largest descendants for each language
  languagesInSelectedSource.forEach((lang) => {
    lang.largestDescendant = getLargestDescendant(lang);
  });

  const [minimumPercentThreshold, setMinimumPercentThreshold] = React.useState(0);
  const [maximumPercentThreshold, setMaximumPercentThreshold] = React.useState(100);

  const filteredLanguages = useMemo(
    () =>
      languagesInSelectedSource.filter((lang) => {
        if (
          lang.largestDescendant == null ||
          lang.populationEstimate == null ||
          lang.populationEstimate === 0
        ) {
          return false;
        }
        const percent =
          ((lang.largestDescendant?.populationEstimate || 0) / (lang.populationEstimate || 1)) *
          100;
        return percent >= minimumPercentThreshold && percent <= maximumPercentThreshold;
      }),
    [languagesInSelectedSource, minimumPercentThreshold, maximumPercentThreshold],
  );

  return (
    <CollapsibleReport title="Largest Descendant">
      This report shows, for each language family or group, which of its descendants is the largest
      language by population. This can help identify which languages are the most prominent within a
      family. It may also reveal some problems in the data, especially if the largest descendant has
      more population than is estimated for the language/language family itself.
      <Selector
        selectorLabel="Minimum % of population"
        options={[0, 25, 50, 75, 90, 95, 99]}
        selected={minimumPercentThreshold}
        onChange={(value: number) => setMinimumPercentThreshold(value)}
      />
      <Selector
        selectorLabel="Maximum % of population"
        options={[75, 90, 95, 99, 99.5, 99.9, 99.99, 100, 1e6]}
        selected={maximumPercentThreshold}
        onChange={(value: number) => setMaximumPercentThreshold(value)}
      />
      <ObjectTable<LanguageData>
        columns={[
          CodeColumn,
          NameColumn,
          {
            key: 'Population',
            render: (lang: LanguageData) => lang.populationEstimate,
            valueType: ValueType.Numeric,
            sortParam: SortBy.Population,
          },
          {
            key: 'Estimated Population of Descendents',
            label: (
              <>
                Estimated Population
                <br /> of Descendents
              </>
            ),
            render: (lang: LanguageData) => lang.populationOfDescendents,
            valueType: ValueType.Numeric,
            sortParam: SortBy.PopulationOfDescendents,
          },
          {
            key: 'Largest Descendant',
            render: (lang: LanguageData) =>
              lang.largestDescendant && (
                <>
                  <HoverableObjectName object={lang.largestDescendant} /> [
                  {lang.largestDescendant.codeDisplay}]
                </>
              ),
          },
          {
            key: 'Descendent Population',
            render: (lang: LanguageData) => lang.largestDescendant?.populationEstimate || null,
            valueType: ValueType.Numeric,
          },

          {
            key: '% Descendent',
            render: (lang: LanguageData) => {
              const relativePopulation =
                getObjectPopulationPercentInBiggestDescendentLanguage(lang);
              return relativePopulation ? numberToFixedUnlessSmall(relativePopulation * 100) : null;
            },
            valueType: ValueType.Numeric,
            sortParam: SortBy.PopulationPercentInBiggestDescendentLanguage,
          },
        ]}
        objects={filteredLanguages}
      />
    </CollapsibleReport>
  );
};

function getLargestDescendant(language: LanguageData): LanguageData | undefined {
  // If it has already been computed, return it.
  if (language.largestDescendant !== undefined) {
    return language.largestDescendant;
  }
  if (language.childLanguages.length === 0) {
    return undefined;
  }

  // We are using populationCited because we want to only use descendants that have a cited population
  // numbers (aka no language families). Dialects rarely but sometimes have cited population numbers
  return language.childLanguages.reduce<LanguageData | undefined>((largest, child) => {
    const childsLargest = getLargestDescendant(child);
    const candidateLargest =
      (childsLargest?.populationCited || 0) > (child.populationCited || 0) ? childsLargest : child;
    if (
      candidateLargest != null &&
      candidateLargest.populationCited != null &&
      candidateLargest.populationCited > 0 &&
      (largest == null || candidateLargest.populationCited > (largest?.populationCited || 0))
    ) {
      return candidateLargest;
    }
    return largest;
  }, undefined);
}

export default LanguagesLargestDescendant;
