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

export function getLanguageScopeDescription(scope: LanguageScope): string {
  switch (scope) {
    case LanguageScope.Family:
      return 'An ancestral and/or geographic group of languages. Most are defined by ISO 639-2 or Glottolog.';
    case LanguageScope.Macrolanguage:
      return 'A group of languages that contain a high degree of mutual intelligibility transcending boundaries in politics, writing, or speech.';
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
