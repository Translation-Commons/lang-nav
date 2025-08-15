import React from 'react';

import CommaSeparated from '../../generic/CommaSeparated';
import { VariantTagData } from '../../types/DataTypes';
import DetailsSection from '../common/details/DetailsSection';
import HoverableObjectName from '../common/HoverableObjectName';

type Props = {
  variantTag: VariantTagData;
};

const VariantTagDetails: React.FC<Props> = ({ variantTag }) => {
  const { ID, dateAdded, prefixes, nameDisplay, description, languages, locales } = variantTag;

  return (
    <div className="Details">
      <DetailsSection title="Attributes">
        <div>
          <label>IANA Code:</label>
          {ID}
        </div>
        <div>
          <label>Name: </label>
          {nameDisplay}
        </div>
        {description && (
          <div>
            <label>Description: </label>
            {description}
          </div>
        )}
        {dateAdded && (
          <div>
            <label>Added: </label>
            {dateAdded.toLocaleDateString()}
          </div>
        )}
      </DetailsSection>

      <DetailsSection title="Connections">
        {prefixes.length > 0 && (
          <div>
            <label>Declared Prefixes:</label>
            <CommaSeparated>{prefixes}</CommaSeparated>
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <label>Language:</label>
            <CommaSeparated>
              {Object.values(languages).map((lang) => (
                <HoverableObjectName key={lang.ID} object={lang} />
              ))}
            </CommaSeparated>
          </div>
        )}
        {locales.length > 0 && (
          <div>
            <label>Locales:</label>
            <CommaSeparated>
              {Object.values(locales).map((locale) => (
                <HoverableObjectName key={locale.ID} object={locale} />
              ))}
            </CommaSeparated>
          </div>
        )}
      </DetailsSection>
    </div>
  );
};

export default VariantTagDetails;
