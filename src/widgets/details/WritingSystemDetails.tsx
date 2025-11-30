import React from 'react';

import PopulationWarning from '@widgets/PopulationWarning';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { WritingSystemData } from '@entities/types/DataTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';
import CountOfPeople from '@shared/ui/CountOfPeople';

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
      <DetailsSection title="Attributes">
        <DetailsField title="Scope:">{scope}</DetailsField>
        {rightToLeft != null && (
          <DetailsField title="Direction">
            {rightToLeft ? 'Right to Left' : 'Left to Right'}
          </DetailsField>
        )}
        {sample && <DetailsField title="Sample">{sample}</DetailsField>}
        <DetailsField title="Unicode Support:">
          {unicodeVersion != null ? (
            `since version ${unicodeVersion}`
          ) : (
            <em>Not supported by Unicode</em>
          )}
        </DetailsField>
        {(populationUpperBound ?? 0) > 100 && ( // Values less than 100 are suspicious and probably spurious
          <DetailsField
            title={
              <>
                Population (Upper Bound
                <PopulationWarning />
                ):
              </>
            }
          >
            <CountOfPeople count={populationUpperBound} />
          </DetailsField>
        )}
      </DetailsSection>

      <DetailsSection title="Connections">
        {primaryLanguageCode != null && (
          <DetailsField title="Primary language:">
            {primaryLanguage != null ? (
              <HoverableObjectName object={primaryLanguage} />
            ) : (
              primaryLanguageCode
            )}
          </DetailsField>
        )}
        {languages && Object.values(languages).length > 0 && (
          <DetailsField title="Languages:">
            <CommaSeparated>
              {Object.values(languages)
                .sort(getSortFunction())
                .map((lang) => (
                  <HoverableObjectName key={lang.ID} object={lang} />
                ))}
            </CommaSeparated>
          </DetailsField>
        )}

        {territoryOfOrigin && (
          <DetailsField title="Territory of Origin:">
            <HoverableObjectName object={territoryOfOrigin} />
          </DetailsField>
        )}

        {localesWhereExplicit && localesWhereExplicit.length > 0 && (
          <DetailsField title="Locales (where writing system is explicit):">
            <CommaSeparated>
              {localesWhereExplicit.sort(getSortFunction()).map((locale) => (
                <HoverableObjectName key={locale.ID} object={locale} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}

        {parentWritingSystem && (
          <DetailsField title="Originated from:">
            <HoverableObjectName object={parentWritingSystem} />
          </DetailsField>
        )}
        {childWritingSystems && childWritingSystems.length > 0 && (
          <DetailsField title="Inspired:">
            <CommaSeparated>
              {childWritingSystems.sort(getSortFunction()).map((writingSystem) => (
                <HoverableObjectName key={writingSystem.ID} object={writingSystem} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}
        {containsWritingSystems && containsWritingSystems.length > 0 && (
          <DetailsField title="Contains:">
            <CommaSeparated>
              {containsWritingSystems.sort(getSortFunction()).map((writingSystem) => (
                <HoverableObjectName key={writingSystem.ID} object={writingSystem} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}
      </DetailsSection>
    </div>
  );
};
export default WritingSystemDetails;
