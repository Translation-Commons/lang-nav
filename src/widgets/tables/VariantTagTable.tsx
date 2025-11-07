import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import HoverableEnumeration from '@features/hovercard/HoverableEnumeration';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableValueType from '@features/table/TableValueType';

import { getObjectPopulation } from '@entities/lib/getObjectPopulation';
import { VariantTagData } from '@entities/types/DataTypes';

const VariantTagTable: React.FC = () => {
  const { variantTags } = useDataContext();

  return (
    <InteractiveObjectTable<VariantTagData>
      objects={variantTags}
      columns={[
        CodeColumn,
        NameColumn,
        {
          key: 'Date Added',
          render: (object) => object.dateAdded?.toLocaleDateString(),
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Date,
        },
        {
          key: 'Languages',
          render: (object) => (
            <HoverableEnumeration items={object.languages.map((lang) => lang.nameDisplay)} />
          ),
          valueType: TableValueType.Numeric,
          sortParam: SortBy.CountOfLanguages,
        },
        {
          key: 'Potential Population',
          description: (
            <>
              <TriangleAlertIcon size="1em" /> This is not the actual population of this variant
              tag, but an estimate based on the language(s) it applies to. If its an orthographic
              variant maybe it applies to the full modern population, but if its a dialect or
              historic variation it may only be a small group of people or only found in
              manuscripts.
            </>
          ),
          render: (object) => getObjectPopulation(object),
          isInitiallyVisible: false,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Population,
        },
      ]}
    />
  );
};

export default VariantTagTable;
