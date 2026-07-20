import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import Field from '@features/transforms/fields/Field';
import { getLanguagesRelevantToObject } from '@features/transforms/filtering/filterByConnections';

import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import CommaSeparated from '@shared/ui/old/CommaSeparated';
import Deemphasized from '@shared/ui/old/Deemphasized';

import { getVariantTypeDisplay } from '@strings/VariantStrings';

import { VariantData } from './VariantTypes';

interface Props {
  data: VariantData;
}

const VariantCard: React.FC<Props> = ({ data }) => {
  const { description } = data;
  const shortDescription =
    description && description.length > 100 ? description.slice(0, 100) + '...' : description;
  const languages = getLanguagesRelevantToObject(data);

  return (
    <div>
      <div className="text-[1.5em] mb-2">
        <ObjectTitle object={data} />
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
              <HoverableObjectName key={lang.ID} object={lang} />
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
