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
  }
}

export function getLanguageScopePlural(scope: LanguageScope): string {
  switch (scope) {
    case LanguageScope.Family:
      return 'language families';
    case LanguageScope.Macrolanguage:
      return 'macrolanguages';
    case LanguageScope.Language:
      return 'languages';
    case LanguageScope.Dialect:
      return 'dialects';
    case LanguageScope.SpecialCode:
      return 'special codes';
  }
}

export function parseLanguageScope(scope: string): LanguageScope | undefined {
  switch (scope.trim().toLowerCase()) {
    case 'language family':
    case 'family':
    case '5': // Numeric value if converted from enum
      return LanguageScope.Family;
    case 'macrolanguage':
    case '4':
      return LanguageScope.Macrolanguage;
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
