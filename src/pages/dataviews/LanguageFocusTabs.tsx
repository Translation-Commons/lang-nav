import React from 'react';

import NavTabs from '@widgets/controls/NavTabs';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

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
  Glottolog = 'Glottolog Languoids',
  Dialects = 'Dialects',
}

const LanguageFocusTabs: React.FC = () => {
  const pageParams = usePageParams();

  return (
    <NavTabs
      label="Language Focus:"
      size="minor"
      options={Object.values(LanguageFocus).map((focus) => {
        const urlParams = getParamsForEntityFocus(focus);
        const { modalityFilter, languageScopes, languageSource, populationFocus } = urlParams;
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
              {populationFocus != null && (
                <div>
                  <strong>Compute population focusing on people</strong>: {populationFocus}
                </div>
              )}
              <div>{getExtraExplanation(focus)}</div>
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
        populationFocus: PopulationFocus.Speaking,
      };
    case LanguageFocus.WrittenLanguages:
      return {
        languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
        languageSource: LanguageSource.ISO,
        modalityFilter: [
          LanguageModality.Written,
          LanguageModality.MostlyWritten,
          LanguageModality.SpokenAndWritten,
        ],
        populationFocus: PopulationFocus.Writing,
      };
    case LanguageFocus.DigitizedLanguages:
      return {
        languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
        languageSource: LanguageSource.CLDR,
        populationFocus: PopulationFocus.Writing,
        // Add CLDR coverage level
      };
    case LanguageFocus.AllLanguages:
      return {
        languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
        languageSource: LanguageSource.Combined,
        modalityFilter: [],
        populationFocus: PopulationFocus.Overall,
      };
    case LanguageFocus.AllLanguoids:
      return {
        languageScopes: [],
        languageSource: LanguageSource.Combined,
        modalityFilter: [],
        populationFocus: PopulationFocus.Overall,
      };
    case LanguageFocus.Glottolog:
      return {
        languageSource: LanguageSource.Glottolog,
      };
    case LanguageFocus.Dialects:
      return {
        languageScopes: [LanguageScope.Dialect],
        populationFocus: PopulationFocus.Speaking,
      };
    default:
      enforceExhaustiveSwitch(focus);
  }
}

function getExtraExplanation(focus: LanguageFocus): string {
  switch (focus) {
    case LanguageFocus.SpokenLanguages:
      return 'Note LangNav does not yet have annotations for all spoken languages.';
    case LanguageFocus.WrittenLanguages:
      return 'Note LangNav does not yet have annotations for all written languages.';
    case LanguageFocus.DigitizedLanguages:
      return 'The table view will also show digital support & CLDR columns by default. Language codes shown will be in the CLDR format which is slightly different than the ISO definitions. For instance, `zh` will represent "Mandarin" not "Chinese" (in general) and `ms` will represent "Malay" not "Malayic" (including Indonesian).';
    case LanguageFocus.AllLanguages:
    case LanguageFocus.AllLanguoids:
    case LanguageFocus.Glottolog:
    case LanguageFocus.Dialects:
      return '';
    default:
      enforceExhaustiveSwitch(focus);
  }
}

export default LanguageFocusTabs;
