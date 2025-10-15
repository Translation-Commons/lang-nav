import { getObjectPopulation } from '@entities/lib/getObjectPopulation';
import { VariantTagData } from '@entities/types/DataTypes';
import { useDataContext } from '@features/data-loading/DataContext';
import { SortBy } from '@features/sorting/SortTypes';
import Hoverable from '@shared/ui/Hoverable';
import HoverableEnumeration from '@shared/ui/HoverableEnumeration';
import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import { CodeColumn, NameColumn } from '../../features/table/CommonColumns';
import ObjectTable from '../../features/table/ObjectTable';

const VariantTagTable: React.FC = () => {
  const { variantTags } = useDataContext();

  return (
    <ObjectTable<VariantTagData>
      objects={variantTags}
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
          key: 'Potential Population',
          label: (
            <Hoverable
              hoverContent={
                <>
                  <TriangleAlertIcon size="1em" /> This is not the actual population of this variant
                  tag, but an estimate based on the language(s) it applies to. If its an
                  orthographic variant maybe it applies to the full modern population, but if its a
                  dialect or historic variation it may only be a small group of people or only found
                  in manuscripts.
                </>
              }
            >
              Potential Population
            </Hoverable>
          ),
          render: (object) => getObjectPopulation(object),
          isInitiallyVisible: false,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
      ]}
    />
  );
};

export default VariantTagTable;
