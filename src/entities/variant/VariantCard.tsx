import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import Field from '@features/transforms/fields/Field';
import { getLanguagesRelevantToEntity } from '@features/transforms/filtering/filterByConnections';

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

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={data} />
      </div>
      <CardField
        title="Type"
        field={Field.VariantType}
        description="What kind of variant it is, whether it's a dialectal or orthographic variation."
      >
        {data.variantType ? (
          getVariantTypeDisplay(data.variantType)
        ) : (
          <Deemphasized>No type specified</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Description"
        field={Field.Description}
        description="Description of this variant."
      >
        {description ? shortDescription : <Deemphasized>No description</Deemphasized>}
      </CardField>

      <CardField
        title="Languages"
        field={Field.Language}
        description="Languages that use this variant."
      >
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
    </div>
  );
};

export default VariantCard;
