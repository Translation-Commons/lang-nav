import React from 'react';

import CardEntityField from '@widgets/cardlists/CardEntityField';
import CardExtraFields from '@widgets/cardlists/CardExtraFields';
import CardField from '@widgets/cardlists/CardField';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import Field from '@features/transforms/fields/Field';


import { Skeleton } from '@shared/ui/skeleton';

import type { CensusData } from './CensusTypes';

interface Props {
  census?: CensusData;
}
const CensusCard: React.FC<Props> = ({ census }) => {
  return (
    <>
      <CardField field={Field.TerritoryPrimary}>
        {census ? (
          census.territory != null ? (
            <HoverableEntityName ent={census.territory} />
          ) : (
            census.isoRegionCode
          )
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardField field={Field.SourceType}>
        {census ? (
          <div>
            {census.collector && <HoverableEntityName ent={census.collector} />}
            {census.presenter && (
              <>
                {' '}
                via <HoverableEntityName ent={census.presenter} style={{ display: 'inline' }} />
              </>
            )}
          </div>
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardEntityField field={Field.Date} ent={census} />
      <CardEntityField field={Field.Modality} ent={census} />
      <CardEntityField field={Field.CountOfLanguages} ent={census} />

      <CardExtraFields
        ent={census}
        excludeFields={[
          Field.Name,
          Field.TerritoryPrimary,
          Field.Organization,
          Field.CountOfLanguages,
          Field.Modality,
          Field.Date,
        ]}
      />
    </>
  );
};

export default CensusCard;
