import React from 'react';

import PopulationWarning from '@widgets/PopulationWarning';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';
import CountOfPeople from '@shared/ui/CountOfPeople';

import DetailsField from './ui/DetailsField';
import DetailsSection from './ui/DetailsSection';

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
  const sortFunction = getSortFunction();

  return (
    <div className="Details">
      <DetailsSection title="Attributes">
        <DetailsField title="Scope">{scope}</DetailsField>
        {rightToLeft != null && (
          <DetailsField title="Direction">
            {rightToLeft ? 'Right to Left' : 'Left to Right'}
          </DetailsField>
        )}
        {sample && <DetailsField title="Sample">{sample}</DetailsField>}
        <DetailsField title="Unicode Support">
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
                <PopulationWarning />)
              </>
            }
          >
            <CountOfPeople count={populationUpperBound} />
          </DetailsField>
        )}
      </DetailsSection>

      <DetailsSection title="Connections">
        {primaryLanguageCode != null && (
          <DetailsField title="Primary language">
            {primaryLanguage != null ? (
              <HoverableEntityName ent={primaryLanguage} />
            ) : (
              primaryLanguageCode
            )}
          </DetailsField>
        )}
        {languages && Object.values(languages).length > 0 && (
          <DetailsField title="Languages">
            <CommaSeparated>
              {Object.values(languages)
                .sort(sortFunction)
                .map((lang) => (
                  <HoverableEntityName key={lang.ID} ent={lang} />
                ))}
            </CommaSeparated>
          </DetailsField>
        )}

        {territoryOfOrigin && (
          <DetailsField title="Territory of Origin">
            <HoverableEntityName ent={territoryOfOrigin} />
          </DetailsField>
        )}

        {localesWhereExplicit && localesWhereExplicit.length > 0 && (
          <DetailsField title="Locales (where writing system is explicit)">
            <CommaSeparated>
              {localesWhereExplicit
                .slice()
                .sort(sortFunction)
                .map((locale) => (
                  <HoverableEntityName key={locale.ID} ent={locale} />
                ))}
            </CommaSeparated>
          </DetailsField>
        )}

        {parentWritingSystem && (
          <DetailsField title="Originated from">
            <HoverableEntityName ent={parentWritingSystem} />
          </DetailsField>
        )}
        {childWritingSystems && childWritingSystems.length > 0 && (
          <DetailsField title="Inspired">
            <CommaSeparated>
              {childWritingSystems
                .slice()
                .sort(sortFunction)
                .map((writingSystem) => (
                  <HoverableEntityName key={writingSystem.ID} ent={writingSystem} />
                ))}
            </CommaSeparated>
          </DetailsField>
        )}
        {containsWritingSystems && containsWritingSystems.length > 0 && (
          <DetailsField title="Contains">
            <CommaSeparated>
              {containsWritingSystems.sort(sortFunction).map((writingSystem) => (
                <HoverableEntityName key={writingSystem.ID} ent={writingSystem} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}
        {writingSystem.outputKeyboards && writingSystem.outputKeyboards.length > 0 && (
          <DetailsField title="Keyboards">
            <CommaSeparated>
              {writingSystem.outputKeyboards.map((keyboard) => (
                <HoverableEntityName key={keyboard.ID} ent={keyboard} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}
      </DetailsSection>
    </div>
  );
};
export default WritingSystemDetails;
