import { VariantTagData, LocaleData } from '../types/DataTypes';
import { LanguageData } from '../types/LanguageTypes';

export function connectVariantTags(
  variantTags: VariantTagData[],
  languageMap: Record<string, LanguageData>,
  locales: Record<string, LocaleData>
): void {
  for (const variant of variantTags) {
    // Link to LanguageData
    variant.languages = variant.associatedLanguageCodes
      .map(code => languageMap[code])
      .filter((lang): lang is LanguageData => !!lang);

    for (const lang of variant.languages) {
      if (!lang.variantTags) lang.variantTags = [];
      lang.variantTags.push(variant);
    }

    // Link to LocaleData
    variant.locales = [];

    for (const locale of Object.values(locales)) {
      if (locale.variantTagID === variant.ID) {
        variant.locales.push(locale);
        locale.variantTag = variant;
      }
    }
  }
}
