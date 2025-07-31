import React from 'react';

import { getSortFunction } from '../../controls/sort';
import CommaSeparated from '../../generic/CommaSeparated';
import { WritingSystemData } from '../../types/DataTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import PopulationWarning from '../common/PopulationWarning';

type Props = {
  writingSystem: WritingSystemData;
};

const WritingSystemDetails: React.FC<Props> = ({ writingSystem }) => {
  const {
    childWritingSystems,
    containsWritingSystems,
    languages,
    localesWhereExplicit,
    parentWritingSystem,
    populationUpperBound,
    primaryLanguage,
    primaryLanguageCode,
    rightToLeft,
    sample,
    scope,
    territoryOfOrigin,
    unicodeVersion,
  } = writingSystem;

  return (
    <div className="Details">
      <div>
        <h3>Attributes</h3>
        <div>
          <label>Scope:</label>
          {scope}
        </div>
        {rightToLeft != null && (
          <div>
            <label>Direction:</label>
            {rightToLeft ? 'Right to Left' : 'Left to Right'}
          </div>
        )}
        {sample && (
          <div>
            <label>Sample:</label>
            {sample}
          </div>
        )}
        <div>
          <label>Unicode Support:</label>
          {unicodeVersion != null ? (
            `since version ${unicodeVersion}`
          ) : (
            <em>Not supported by Unicode</em>
          )}
        </div>
        {populationUpperBound > 100 && ( // Values less than 100 are suspcious and probably spurious
          <div>
            <label>
              Population (Upper Bound
              <PopulationWarning />
              ):
            </label>
            {populationUpperBound.toLocaleString()}
          </div>
        )}
      </div>

      <div>
        <h3>Connections</h3>
        {primaryLanguageCode != null && (
          <div>
            <label>Primary language:</label>
            {primaryLanguage != null ? (
              <HoverableObjectName object={primaryLanguage} />
            ) : (
              primaryLanguageCode
            )}
          </div>
        )}
        {Object.values(languages).length > 0 && (
          <div>
            <label>Languages:</label>
            <CommaSeparated>
              {Object.values(languages)
                .sort(getSortFunction())
                .map((lang) => (
                  <HoverableObjectName key={lang.ID} object={lang} />
                ))}
            </CommaSeparated>
          </div>
        )}

        {territoryOfOrigin && (
          <div>
            <label>Territory of Origin:</label>
            <HoverableObjectName object={territoryOfOrigin} />
          </div>
        )}

        {localesWhereExplicit.length > 0 && (
          <div>
            <label>Locales (where writing system is explicit):</label>
            <CommaSeparated>
              {localesWhereExplicit.sort(getSortFunction()).map((locale) => (
                <HoverableObjectName key={locale.ID} object={locale} />
              ))}
            </CommaSeparated>
          </div>
        )}

        {parentWritingSystem && (
          <div>
            <label>Originated from:</label>
            <HoverableObjectName object={parentWritingSystem} />
          </div>
        )}
        {childWritingSystems.length > 0 && (
          <div>
            <label>Inspired:</label>
            <CommaSeparated>
              {childWritingSystems.sort(getSortFunction()).map((writingSystem) => (
                <HoverableObjectName key={writingSystem.ID} object={writingSystem} />
              ))}
            </CommaSeparated>
          </div>
        )}
        {containsWritingSystems.length > 0 && (
          <div>
            <label>Contains:</label>
            <CommaSeparated>
              {containsWritingSystems.sort(getSortFunction()).map((writingSystem) => (
                <HoverableObjectName key={writingSystem.ID} object={writingSystem} />
              ))}
            </CommaSeparated>
          </div>
        )}
      </div>
    </div>
  );
};
export default WritingSystemDetails;
