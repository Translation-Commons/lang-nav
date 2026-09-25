import { LanguageScope } from '@entities/language/LanguageTypes';

export function getLanguageScopeLabel(scope?: LanguageScope): string {
  if (scope == null) return 'Language';

  switch (scope) {
    case LanguageScope.BroadGrouping:
      return 'Broad Grouping';
    case LanguageScope.Family:
      return 'Family';
    case LanguageScope.Subfamily:
      return 'Subfamily';
    case LanguageScope.Macrolanguage:
      return 'Macrolanguage';
    case LanguageScope.Intermediate:
      return 'Intermediate';
    case LanguageScope.Language:
      return 'Individual Language';
    case LanguageScope.Dialect:
      return 'Dialect';
    case LanguageScope.SpecialCode:
      return 'Special Code';
  }
}

export function getLanguageScopePlural(scope: LanguageScope): string {
  switch (scope) {
    case LanguageScope.BroadGrouping:
      return 'broad groupings';
    case LanguageScope.Family:
      return 'language families';
    case LanguageScope.Subfamily:
      return 'language subfamilies';
    case LanguageScope.Macrolanguage:
      return 'macrolanguages';
    case LanguageScope.Intermediate:
      return 'intermediates';
    case LanguageScope.Language:
      return 'languages';
    case LanguageScope.Dialect:
      return 'dialects';
    case LanguageScope.SpecialCode:
      return 'special codes';
  }
}

export function getLanguageScopeDescription(scope: LanguageScope): string {
  switch (scope) {
    case LanguageScope.BroadGrouping:
      return 'An geographic grouping of languages -- not necessarily reflective of an ancestral relationship.';
    case LanguageScope.Family:
      return 'An accepted common ancestry for a group of languages -- limited to the first level of classification.';
    case LanguageScope.Subfamily:
      return 'A subgroup within a language family, representing a collection of languages that share a common ancestry. Most of these come from Glottolog and have been re-classified as subfamilies.';
    case LanguageScope.Macrolanguage:
      return 'A group of languages that contain a partial degree of mutual intelligibility transcending boundaries in politics, writing, or speech.';
    case LanguageScope.Intermediate:
      return 'A subgroup within a macrolanguage, representing a collection of partially intelligible languages that are more common with eachother than others within the same macrolanguage.';
    case LanguageScope.Language:
      return 'A system of communication where users can understand each other better than anyone in other individual languages -- usually with a specific common speaking, writing, or gesturing standard.';
    case LanguageScope.Dialect:
      return 'A system of communication that is mutually intelligible with other dialects in the same language, but will have differences in speech, writing, word choice, cultural norms, or other linguistic norms.';
    case LanguageScope.SpecialCode:
      return 'This language-like entity may be a special code not corresponding to a modern language, for instance the lack of language or a language that may no longer be considered valid.';
  }
}

export function parseLanguageScope(scope: string): LanguageScope | undefined {
  switch (scope.trim().toLowerCase()) {
    case 'broad grouping':
    case 'broad':
    case '8': // Numeric value if converted from enum
      return LanguageScope.BroadGrouping;
    case 'language family':
    case 'family':
    case '7':
      return LanguageScope.Family;
    case 'subfamily':
    case '6':
      return LanguageScope.Subfamily;
    case 'macrolanguage':
    case 'macro':
    case '5':
      return LanguageScope.Macrolanguage;
    case 'intermediate':
    case '4':
      return LanguageScope.Intermediate;
    case 'individual language':
    case 'language':
    case '3':
      return LanguageScope.Language;
    case 'dialect':
    case '2':
      return LanguageScope.Dialect;
    case 'special code':
    case '1':
      return LanguageScope.SpecialCode;
    case '0':
    case '':
      return undefined;
    default:
      console.debug(`Unknown language scope encountered: ${scope}`);
      return undefined;
  }
}
