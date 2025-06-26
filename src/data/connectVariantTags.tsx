import { VariantTagData, LocaleData } from '../types/DataTypes';
import { LanguageData } from '../types/LanguageTypes';

export function connectVariantTags(
  variantTags: VariantTagData[],
  languageMap: Record<string, LanguageData>,
  locales: Record<string, LocaleData>,
): void {
  //Link variants to languages and link languages back to variants
  const variantTagMap: Record<string, VariantTagData> = {};

  for (const variant of variantTags) {
    //Store in lookup map
    variantTagMap[variant.ID] = variant;

    //Link to LanguageData
    variant.languages = variant.associatedLanguageCodes
      .map((code) => languageMap[code])
      .filter((lang): lang is LanguageData => !!lang);

    //Link back from LanguageData to VariantTag
    for (const lang of variant.languages) {
      if (!lang.variantTag) lang.variantTag = [];
      lang.variantTag.push(variant);
    }

    //Initialize locales array
    variant.locales = [];
  }

  //Link locales to variants and vice versa (efficient O(n) pass)
  for (const locale of Object.values(locales)) {
    const variant = locale.variantTagID ? variantTagMap[locale.variantTagID] : undefined;
    if (variant) {
      variant.locales.push(locale);
      locale.variantTags = variant;
    }
  }
}
