import React from 'react';

import CommaSeparated from '../../generic/CommaSeparated';
import { VariantTagData } from '../../types/DataTypes';
import HoverableObjectName from '../common/HoverableObjectName';

type Props = {
  variantTag: VariantTagData;
};

const VariantTagDetails: React.FC<Props> = ({ variantTag }) => {
  const { ID, added, prefixes, nameDisplay, description, languages, locales } = variantTag;

  return (
    <div className="Details">
      <div className="section">
        <h3>Attributes</h3>
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
        {added && (
          <div>
            <label>Added: </label>
            {added.toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="section">
        <h3>Connections</h3>
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
      </div>
    </div>
  );
};

export default VariantTagDetails;
