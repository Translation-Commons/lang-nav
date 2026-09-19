import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import { getLanguagesRelevantToEntity } from '@features/transforms/filtering/filterByConnections';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import EntityTitle from '@entities/ui/EntityTitle';

import CardField from '@shared/containers/CardField';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { getVariantTypeDisplay } from '@strings/VariantStrings';

import { VariantData } from './VariantTypes';

interface Props {
  data: VariantData;
}

const VariantCard: React.FC<Props> = ({ data }) => {
  const { description } = data;
  const shortDescription =
    description && description.length > 100 ? description.slice(0, 100) + '...' : description;
  const languages = getLanguagesRelevantToEntity(data);

  const extraFields = useActiveTransforms([
    Field.Name,
    Field.Code,
    Field.VariantType,
    Field.Description,
    Field.Language,
  ]);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={data} />
      </div>
      <CardField field={Field.VariantType}>
        {data.variantType ? (
          getVariantTypeDisplay(data.variantType)
        ) : (
          <Deemphasized>No type specified</Deemphasized>
        )}
      </CardField>

      <CardField field={Field.Description}>
        {description ? shortDescription : <Deemphasized>No description</Deemphasized>}
      </CardField>

      <CardField field={Field.Language}>
        {languages.length > 0 ? (
          <CommaSeparated>
            {languages.map((lang) => (
              <HoverableEntityName key={lang.ID} ent={lang} />
            ))}
          </CommaSeparated>
        ) : (
          <Deemphasized>No languages specified</Deemphasized>
        )}
      </CardField>

      {extraFields.map((field) => (
        <CardField key={field} field={field}>
          <EntityFieldDisplay ent={data} field={field} />
        </CardField>
      ))}
    </div>
  );
};

export default VariantCard;
