import { LanguageData, LanguageScope } from './LanguageTypes';

export function getLanguageRootLanguageFamily(lang: LanguageData): LanguageData {
  if (lang.parentLanguage) return getLanguageRootLanguageFamily(lang.parentLanguage);
  return lang;
}

export function getLanguageRootMacrolanguage(lang: LanguageData): LanguageData | undefined {
  return getCurrentMacrolanguage(lang) ?? getISOMacrolanguage(lang);
}

function getCurrentMacrolanguage(lang: LanguageData): LanguageData | undefined {
  if (lang.scope === LanguageScope.Macrolanguage) return lang;
  // We do have to explore language families here because some macrolanguages are nested inside families
  // For example Semitic [family] -> Arabic [macrolanguage] -> North African Arabic [family] -> Hassaniyya [language]
  // if (lang.scope === LanguageScope.Family) return undefined;
  if (lang.parentLanguage) return getLanguageRootMacrolanguage(lang.parentLanguage);
  return undefined;
}

// Language groupings in ISO and Glottolog are sometimes different.
// For instance, Hassaniyya [mey/hass1238]...
//    is in North African Arabic [nort3191] which is a language family in glottolog but not in ISO
//    which is in Arabic [ara/arab1395] which is a macrolanguage in ISO (family in glottolog)
function getISOMacrolanguage(lang: LanguageData): LanguageData | undefined {
  if (lang.ISO.scope === LanguageScope.Macrolanguage) return lang;
  if (lang.ISO.scope === LanguageScope.Family) return undefined;
  if (lang.ISO.parentLanguage) return getLanguageRootMacrolanguage(lang.ISO.parentLanguage);
  return undefined;
}
