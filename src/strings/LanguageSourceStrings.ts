import { LanguageSource } from '@entities/language/LanguageTypes';

export function getSourceLabel(languageSource: LanguageSource): string {
  switch (languageSource) {
    case LanguageSource.Combined:
      return 'Combined by LangNav (in ISO, Glottolog or other source, with some taxonomy adjustments)';
    case LanguageSource.ISO:
      return 'ISO-639-1/3 and ISO-639-5';
    case LanguageSource.CLDR:
      return 'CLDR (ISO-639-1/3 with macrolanguage adjustments)';
    case LanguageSource.Glottolog:
      return 'Glottolog';
    default:
      return '';
  }
}
