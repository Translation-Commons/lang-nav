import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import { LanguageModality } from '@entities/language/writing/LanguageModality';
import PopulationFocus from '@entities/types/PopulationFocus';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { PageParams } from './PageParamTypes';

export enum LanguageFocus {
  SpokenLanguages = 'Spoken & Sign Languages',
  WrittenLanguages = 'Written Languages',
  DigitizedLanguages = 'Digitized Languages',
  AllLanguages = 'All Languages',
  AllLanguoids = 'All Languages, Families, and Dialects',
  Glottolog = 'Glottolog Languoids',
  Dialects = 'Dialects',
}

export function getParamsForLanguageFocus(focus: LanguageFocus): Partial<PageParams> {
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
