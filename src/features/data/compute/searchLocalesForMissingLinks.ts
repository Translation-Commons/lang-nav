import { getLocaleCodeFromTags, LocaleTags } from '@entities/locale/LocaleStrings';
import { BCP47LocaleCode, LocaleData } from '@entities/types/DataTypes';

import { unique } from '@shared/lib/setUtils';

export function searchLocalesForMissingLinks(locales: Record<BCP47LocaleCode, LocaleData>): void {
  Object.values(locales).forEach((locale) => {
    if (!locale.relatedLocales) locale.relatedLocales = {};
    const relatedLocales = locale.relatedLocales ?? {};
    const localeTags: LocaleTags = {
      languageCode: locale.languageCode,
      scriptCode: locale.scriptCode,
      territoryCode: locale.territoryCode,
      variantTagCodes: locale.variantTagCodes,
    };

    // If this locale is missing a link to its parent territory locale, try to find it
    if (locale.territory?.parentUNRegion && !relatedLocales.parentTerritory) {
      const parentLocaleTags = { ...localeTags, territoryCode: locale.territory.parentUNRegion.ID };
      const parentLocaleCode = getLocaleCodeFromTags(parentLocaleTags);
      const parentLocale = locales[parentLocaleCode];
      if (parentLocale) {
        relatedLocales.parentTerritory = parentLocale;
        if (!parentLocale.relatedLocales) parentLocale.relatedLocales = {};
        if (!parentLocale.relatedLocales?.childTerritories)
          parentLocale.relatedLocales.childTerritories = [];
        parentLocale.relatedLocales.childTerritories.push(locale);
      }
    }

    // Connect locales to the parent locale in the language family
    if (locale.language?.ISO.parentLanguage && !relatedLocales.parentLanguage) {
      const parentLocaleTags = {
        ...localeTags,
        languageCode: locale.language?.ISO.parentLanguage.ID,
      };
      const parentLocaleCode = getLocaleCodeFromTags(parentLocaleTags);
      const parentLocale = locales[parentLocaleCode];
      if (parentLocale) {
        relatedLocales.parentLanguage = parentLocale;
        if (!parentLocale.relatedLocales) parentLocale.relatedLocales = {};
        if (!parentLocale.relatedLocales.childLanguages)
          parentLocale.relatedLocales.childLanguages = [];
        parentLocale.relatedLocales.childLanguages.push(locale);
      }
    }

    // Try different combinations of the partial subtags
    getLessSpecificLocaleTags(localeTags).forEach((moreGeneralLocaleCode) => {
      if (moreGeneralLocaleCode === getLocaleCodeFromTags(localeTags)) return; // skip self
      const foundLocale = locales[moreGeneralLocaleCode];
      if (foundLocale) {
        if (!relatedLocales.moreGeneral) relatedLocales.moreGeneral = [];
        relatedLocales.moreGeneral.push(foundLocale);
        if (!foundLocale.relatedLocales) foundLocale.relatedLocales = {};
        if (!foundLocale.relatedLocales.moreSpecific) foundLocale.relatedLocales.moreSpecific = [];
        foundLocale.relatedLocales.moreSpecific.push(locale);
      }
    });
  });
}

function getLessSpecificLocaleTags(localeTags: LocaleTags): string[] {
  const lessVariantTags =
    localeTags.variantTagCodes?.flatMap((variantTagCode) =>
      getLessSpecificLocaleTags({
        languageCode: localeTags.languageCode,
        scriptCode: localeTags.scriptCode,
        territoryCode: localeTags.territoryCode,
        variantTagCodes: localeTags.variantTagCodes?.filter((v) => v !== variantTagCode),
      }),
    ) || [];
  const withoutScript = localeTags.scriptCode
    ? getLessSpecificLocaleTags({
        languageCode: localeTags.languageCode,
        territoryCode: localeTags.territoryCode,
        variantTagCodes: localeTags.variantTagCodes,
      })
    : [];
  const withoutTerritory = localeTags.territoryCode
    ? getLessSpecificLocaleTags({
        languageCode: localeTags.languageCode,
        scriptCode: localeTags.scriptCode,
        variantTagCodes: localeTags.variantTagCodes,
      })
    : [];

  return unique(
    [
      ...lessVariantTags,
      ...withoutScript,
      ...withoutTerritory,
      getLocaleCodeFromTags(localeTags),
    ].filter(Boolean),
  );
}
