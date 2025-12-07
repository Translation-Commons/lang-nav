import { LanguageScope } from '@entities/language/LanguageTypes';

export function getLanguageScopeLabel(scope?: LanguageScope): string {
  if (scope == null) return 'Language';

  switch (scope) {
    case LanguageScope.Family:
      return 'Language Family';
    case LanguageScope.Macrolanguage:
      return 'Macrolanguage';
    case LanguageScope.Language:
      return 'Language';
    case LanguageScope.Dialect:
      return 'Dialect';
    case LanguageScope.SpecialCode:
      return 'Special Code';
    default:
      return 'Unknown Scope';
  }
}
