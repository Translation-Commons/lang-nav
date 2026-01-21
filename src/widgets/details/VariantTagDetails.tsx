import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { VariantTagData } from '@entities/types/DataTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';

type Props = {
  variantTag: VariantTagData;
};

const VariantTagDetails: React.FC<Props> = ({ variantTag }) => {
  const { ID, dateAdded, prefixes, nameDisplay, description, languages, locales } = variantTag;

  return (
    <div className="Details">
      <DetailsSection title="Attributes">
        <DetailsField title="IANA Code">{ID}</DetailsField>
        <DetailsField title="Name">{nameDisplay}</DetailsField>
        {description && <DetailsField title="Description">{description}</DetailsField>}
        {dateAdded && <DetailsField title="Added">{dateAdded.toLocaleDateString()}</DetailsField>}
      </DetailsSection>

      <DetailsSection title="Connections">
        {prefixes.length > 0 && (
          <DetailsField title="Declared Prefixes">
            <CommaSeparated>{prefixes}</CommaSeparated>
          </DetailsField>
        )}
        {languages.length > 0 && (
          <DetailsField title="Languages">
            <CommaSeparated>
              {Object.values(languages).map((lang) => (
                <HoverableObjectName key={lang.ID} object={lang} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}
        {locales.length > 0 && (
          <DetailsField title="Locales">
            <CommaSeparated>
              {Object.values(locales).map((locale) => (
                <HoverableObjectName key={locale.ID} object={locale} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}
      </DetailsSection>
    </div>
  );
};

export default VariantTagDetails;
