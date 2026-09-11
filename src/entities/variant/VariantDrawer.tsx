import React from 'react';

import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';
import DrawerDetailsSection from '@widgets/details/ui/DrawerDetailsSection';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { VariantData } from '@entities/variant/VariantTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

import { getVariantTypeDescription, getVariantTypeDisplay } from '@strings/VariantStrings';

type Props = {
  variant: VariantData;
};

const VariantDrawer: React.FC<Props> = ({ variant }) => {
  return (
    <div className="flex flex-col gap-3">
      <VariantAttributesSection variant={variant} />
      <VariantConnectionsSection variant={variant} />
    </div>
  );
};

const VariantAttributesSection: React.FC<{ variant: VariantData }> = ({ variant }) => {
  const { ID, dateAdded, nameDisplay, description, variantType } = variant;

  return (
    <DrawerDetailsSection title="Attributes">
      <DrawerDetailsField label="IANA Code">{ID}</DrawerDetailsField>
      {variantType && (
        <DrawerDetailsField label="Type">
          <Hoverable hoverContent={getVariantTypeDescription(variantType)}>
            {getVariantTypeDisplay(variantType)}
          </Hoverable>
        </DrawerDetailsField>
      )}
      <DrawerDetailsField label="Name">{nameDisplay}</DrawerDetailsField>
      {description && (
        <DrawerDetailsField label="Description" expandedContent={description}>
          <div className="truncate ellipsis max-w-30">{description}</div>
        </DrawerDetailsField>
      )}
      {dateAdded && (
        <DrawerDetailsField label="Added">{dateAdded.toLocaleDateString()}</DrawerDetailsField>
      )}
    </DrawerDetailsSection>
  );
};

const VariantConnectionsSection: React.FC<{ variant: VariantData }> = ({ variant }) => {
  const { languages, locales, equivalentLanguage, prefixes } = variant;

  if (
    languages.length === 0 &&
    locales.length === 0 &&
    !equivalentLanguage &&
    prefixes.length === 0
  ) {
    return null;
  }

  return (
    <DrawerDetailsSection title="Connections">
      {prefixes.length > 0 && (
        <DrawerDetailsField label="Declared Prefixes">
          <CommaSeparated>{prefixes}</CommaSeparated>
        </DrawerDetailsField>
      )}
      {languages.length > 0 && (
        <DrawerDetailsField label="Languages">
          <CommaSeparated>
            {Object.values(languages).map((lang) => (
              <HoverableEntityName key={lang.ID} ent={lang} />
            ))}
          </CommaSeparated>
        </DrawerDetailsField>
      )}
      {locales.length > 0 && (
        <DrawerDetailsField
          label="Locales"
          expandedContent={
            <CommaSeparated>
              {Object.values(locales).map((locale) => (
                <HoverableEntityName key={locale.ID} ent={locale} />
              ))}
            </CommaSeparated>
          }
        >
          {locales.length.toLocaleString()}
        </DrawerDetailsField>
      )}
      {equivalentLanguage && equivalentLanguage.ID !== 'mis' && (
        <DrawerDetailsField label="Equivalent Language">
          <HoverableEntityName ent={equivalentLanguage} />
        </DrawerDetailsField>
      )}
    </DrawerDetailsSection>
  );
};

export default VariantDrawer;
