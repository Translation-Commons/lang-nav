import React from 'react';

import NavTabs from '@widgets/controls/NavTabs';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import Deemphasized from '@shared/ui/Deemphasized';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

export enum LanguageFocus {
  SpokenLanguages = 'Spoken & Sign Languages',
  WrittenLanguages = 'Written Languages',
  DigitizedLanguages = 'Digitized Languages',
  AllLanguages = 'All Languages',
  AllLanguoids = 'All Languages, Families, and Dialects',
}

const LanguageFocusTabs: React.FC = () => {
  const pageParams = usePageParams();

  return (
    <NavTabs
      label="Language Focus:"
      size="minor"
      options={Object.values(LanguageFocus).map((focus) => {
        const urlParams = getParamsForEntityFocus(focus);
        const { modalityFilter, languageScopes, languageSource } = urlParams;
        return {
          description: (
            <>
              Limit the languages and language-like categories shown on the page to:
              {modalityFilter != null && (
                <div>
                  <strong>Medium of Use</strong>:{' '}
                  {modalityFilter.length ? (
                    <>
                      {(modalityFilter ?? pageParams.modalityFilter)
                        .map(getModalityLabel)
                        .join(', ')}
                      <Deemphasized>
                        {' '}
                        (note: this filter is not configured for most languages with a population
                        less than 1 million)
                      </Deemphasized>
                    </>
                  ) : (
                    'Any'
                  )}
                </div>
              )}
              {languageScopes != null && (
                <div>
                  <strong>Scope</strong>:{' '}
                  {languageScopes.length
                    ? languageScopes.map(getLanguageScopeLabel).join(', ')
                    : 'Any'}
                </div>
              )}
              {languageSource != null && (
                <div>
                  <strong>Language List</strong>: {languageSource}
                </div>
              )}
            </>
          ),
          label: focus,
          urlParams,
        };
      })}
    />
  );
};

function getParamsForEntityFocus(focus: LanguageFocus): Partial<PageParams> {
  switch (focus) {
    case LanguageFocus.SpokenLanguages:
      return {
        languageScopes: [LanguageScope.Language],
        modalityFilter: [
          LanguageModality.Spoken,
          LanguageModality.MostlySpoken,
          LanguageModality.SpokenAndWritten,
          LanguageModality.Sign,
        ],
      };
    case LanguageFocus.WrittenLanguages:
      return {
        languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
        modalityFilter: [
          LanguageModality.Written,
          LanguageModality.MostlyWritten,
          LanguageModality.SpokenAndWritten,
        ],
      };
    case LanguageFocus.DigitizedLanguages:
      return {
        languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
        languageSource: LanguageSource.ISO,
        // Add CLDR coverage level
      };
    case LanguageFocus.AllLanguages:
      return {
        languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
        languageSource: LanguageSource.Combined,
        modalityFilter: [],
      };
    case LanguageFocus.AllLanguoids:
      return {
        languageScopes: [],
        languageSource: LanguageSource.Combined,
        modalityFilter: [],
      };
    default:
      enforceExhaustiveSwitch(focus);
  }
}

export default LanguageFocusTabs;
