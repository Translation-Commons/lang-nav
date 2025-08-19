import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import { useDataContext } from '../../data/DataContext';
import Hoverable from '../../generic/Hoverable';
import HoverableEnumeration from '../../generic/HoverableEnumeration';
import { VariantTagData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CodeColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

const VariantTagTable: React.FC = () => {
  const { variantTags } = useDataContext();

  return (
    <ObjectTable<VariantTagData>
      objects={Object.values(variantTags)}
      columns={[
        CodeColumn,
        NameColumn,
        {
          key: 'Date Added',
          render: (object) => object.dateAdded?.toLocaleDateString(),
          isInitiallyVisible: false,
          isNumeric: true,
          sortParam: SortBy.Date,
        },
        {
          key: 'Languages',
          render: (object) => (
            <HoverableEnumeration items={object.languages.map((lang) => lang.nameDisplay)} />
          ),
          isNumeric: true,
          sortParam: SortBy.CountOfLanguages,
        },
        {
          key: 'Cited Population',
          label: (
            <Hoverable
              hoverContent={
                <>
                  <TriangleAlertIcon size="1em" /> This figure is a lower bound based on census
                  data: it sums the number of speakers recorded for locales that explicitly cite
                  this variant tag.  In many cases there will be no cited population and this will
                  be zero.
                </>
              }
            >
              Cited Population
            </Hoverable>
          ),
          render: (object) => {
            // Cast to any so we can access the optional property
            const cited = (object as any).populationCited;
            return typeof cited === 'number' && cited > 0 ? cited : 0;
          },
          isInitiallyVisible: false,
          isNumeric: true,
          // Sort by cited population.  Use population sort param here so that the page param
          // remains stable, but getObjectPopulation will prioritise cited population first.
          sortParam: SortBy.Population,
        },
        {
          key: 'Upper Bound Population',
          label: (
            <Hoverable
              hoverContent={
                <>
                  <TriangleAlertIcon size="1em" /> This is not the actual population of this variant
                  tag, but an upper bound based on the language(s) it applies to.  If this is an
                  orthographic variant it might apply to the full modern population, but if it is a
                  dialect or historic variation it may only be a small group of people or only found
                  in manuscripts.
                </>
              }
            >
              Potential Population
            </Hoverable>
          ),
          render: (object) => {
            const upper = (object as any).populationUpperBound;
            return typeof upper === 'number' && upper > 0 ? upper : 0;
          },
          isInitiallyVisible: false,
          isNumeric: true,
          // Still sort by the main population param so upper bound works with descending sorts
          sortParam: SortBy.Population,
        },
      ]}
    />
  );
};

export default VariantTagTable;
