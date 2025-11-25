import { LanguageData, LanguageScope } from './LanguageTypes';

// The same as the language family
export function getLanguageRoot(lang: LanguageData): LanguageData {
  if (lang.parentLanguage) return getLanguageRoot(lang.parentLanguage);
  return lang;
}

export function getMacrolanguage(lang: LanguageData): LanguageData | undefined {
  if (lang.scope === LanguageScope.Macrolanguage) return lang;
  if (lang.scope === LanguageScope.Family) return undefined;
  if (lang.parentLanguage) return getMacrolanguage(lang.parentLanguage);
  return undefined;
}
