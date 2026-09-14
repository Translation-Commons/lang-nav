import React from 'react';

import NavTabs from '@widgets/controls/NavTabs';

import { getParamsForLanguageFocus, LanguageFocus } from '@features/params/LanguageFocus';
import usePageParams from '@features/params/usePageParams';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import Deemphasized from '@shared/ui/Deemphasized';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

const LanguageFocusTabs: React.FC = () => {
  const pageParams = usePageParams();

  return (
    <NavTabs
      label="Language Focus:"
      size="minor"
      options={Object.values(LanguageFocus).map((focus) => {
        const urlParams = getParamsForLanguageFocus(focus);
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
