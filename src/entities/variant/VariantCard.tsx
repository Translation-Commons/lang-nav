import React from 'react';

import CardEntityField from '@widgets/cardlists/CardEntityField';
import CardExtraFields from '@widgets/cardlists/CardExtraFields';
import CardField from '@widgets/cardlists/CardField';

import Field from '@features/transforms/fields/Field';

import Deemphasized from '@shared/ui/Deemphasized';
import { Skeleton } from '@shared/ui/skeleton';

import type { VariantData } from './VariantTypes';

interface Props {
  data?: VariantData;
}

const VariantCard: React.FC<Props> = ({ data }) => {
  return (
    <>
      <CardEntityField field={Field.VariantType} ent={data} />

      <CardField field={Field.Description}>
        {data ? (
          <Description description={data.description} />
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardEntityField field={Field.LanguageList} ent={data} />

      <CardExtraFields
        ent={data}
        excludeFields={[
          Field.Name,
          Field.Code,
          Field.VariantType,
          Field.Description,
          Field.LanguageList,
        ]}
      />
    </>
  );
};

const Description: React.FC<{ description?: string }> = ({ description }) => {
  const shortDescription =
    description && description.length > 100 ? description.slice(0, 100) + '...' : description;

  return <>{description ? shortDescription : <Deemphasized>No description</Deemphasized>}</>;
};

export default VariantCard;
