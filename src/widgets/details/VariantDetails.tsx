import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { VariantData } from '@entities/variant/VariantTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';

import { getVariantTypeDescription, getVariantTypeDisplay } from '@strings/VariantStrings';

type Props = {
  variant: VariantData;
};

const VariantDetails: React.FC<Props> = ({ variant }) => {
  return (
    <div className="Details">
      <VariantAttributesSection variant={variant} />
      <VariantConnectionsSection variant={variant} />
    </div>
  );
};

const VariantAttributesSection: React.FC<{ variant: VariantData }> = ({ variant }) => {
  const { ID, dateAdded, nameDisplay, description, variantType } = variant;

  return (
    <DetailsSection title="Attributes">
      <DetailsField title="IANA Code">{ID}</DetailsField>
      {variantType && (
        <DetailsField title="Type">
          <Hoverable hoverContent={getVariantTypeDescription(variantType)}>
            {getVariantTypeDisplay(variantType)}
          </Hoverable>
        </DetailsField>
      )}
      <DetailsField title="Name">{nameDisplay}</DetailsField>
      {description && <DetailsField title="Description">{description}</DetailsField>}
      {dateAdded && <DetailsField title="Added">{dateAdded.toLocaleDateString()}</DetailsField>}
    </DetailsSection>
  );
};

const VariantConnectionsSection: React.FC<{ variant: VariantData }> = ({ variant }) => {
  const { languages, locales, languoid, prefixes } = variant;

  if (languages.length === 0 && locales.length === 0 && !languoid && prefixes.length === 0) {
    return null;
  }

  return (
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
      {languoid && (
        <DetailsField title="Languoid">
          <HoverableObjectName object={languoid} />
        </DetailsField>
      )}
    </DetailsSection>
  );
};

export default VariantDetails;
