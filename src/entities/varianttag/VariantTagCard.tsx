import { LanguagesIcon, TextIcon } from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { VariantTagData } from '@entities/types/DataTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

interface Props {
  data: VariantTagData;
}

const VariantTagCard: React.FC<Props> = ({ data }) => {
  const { description, languages } = data;
  const shortDescription =
    description && description.length > 100 ? description.slice(0, 100) + '...' : description;

  return (
    <div>
      <h3>
        <ObjectTitle object={data} />
      </h3>

      <CardField title="Description" icon={TextIcon} description="Description of this variant tag.">
        {description ? shortDescription : <Deemphasized>No description</Deemphasized>}
      </CardField>

      <CardField
        title="Languages"
        icon={LanguagesIcon}
        description="Languages that use this variant tag."
      >
        {languages && Object.values(languages).length > 0 ? (
          <CommaSeparated>
            {Object.values(languages).map((lang) => (
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

export default VariantTagCard;
