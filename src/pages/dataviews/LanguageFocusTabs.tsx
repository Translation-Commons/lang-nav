import React from 'react';

import NavTabs from '@widgets/controls/NavTabs';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

export enum LanguageFocus {
  SpokenLanguages = 'Spoken & Sign Languages',
  WrittenLanguages = 'Written Languages',
  ISOLanguages = 'ISO 639-3 Languages',
  // DigitalLanguages = 'Digital Languages', // TODO
  AllLanguages = 'All Languages',
  AllLanguoids = 'All Languages, Families, and Dialects',
}

const LanguageFocusTabs: React.FC = () => {
  const pageParams = usePageParams();

  return (
    <NavTabs
      size="minor"
      options={Object.values(LanguageFocus).map((focus) => {
        const urlParams = getParamsForEntityFocus(focus);
        const { modalityFilter, languageScopes, languageSource } = urlParams;
        return {
          description: (
            <>
              Limit the languages and language-like categories shown on the page to:
              <div>
                <strong>Medium of Use</strong>:{' '}
                {modalityFilter?.length ? modalityFilter.map(getModalityLabel).join(', ') : 'Any'}
              </div>
              <div>
                <strong>Scope</strong>:{' '}
                {languageScopes?.length
                  ? languageScopes.map(getLanguageScopeLabel).join(', ')
                  : 'Any'}
              </div>
              <div>
                <strong>Language List</strong>: {languageSource ?? pageParams.languageSource}
              </div>
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
    case LanguageFocus.ISOLanguages:
      return {
        languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
        languageSource: LanguageSource.ISO,
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
        modalityFilter: [],
      };
    default:
      enforceExhaustiveSwitch(focus);
  }
}

export default LanguageFocusTabs;
