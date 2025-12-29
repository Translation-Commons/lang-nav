import { LocaleSeparator } from '@features/params/PageParamTypes';

import { ISO3166Code, LocaleData } from '@entities/types/DataTypes';

export function getLocaleCode(
  locale: LocaleData,
  localeSeparator: LocaleSeparator,
  territoryOverride?: ISO3166Code,
): string {
  return [
    locale.language?.codeDisplay ?? locale.languageCode,
    locale.scriptCode,
    territoryOverride ?? locale.territoryCode,
    ...(locale.variantTagCodes ?? []),
  ]
    .filter(Boolean)
    .join(localeSeparator);
}

export type LocaleTags = {
  languageCode: string;
  scriptCode?: string;
  territoryCode?: string;
  variantTagCodes?: string[];
};

export function getLocaleCodeFromTags(
  localeTags: LocaleTags,
  localeSeparator: LocaleSeparator = LocaleSeparator.Underscore,
  territoryOverride?: ISO3166Code,
): string {
  return [
    localeTags.languageCode,
    localeTags.scriptCode,
    territoryOverride ?? localeTags.territoryCode,
    ...(localeTags.variantTagCodes ?? []),
  ]
    .filter(Boolean)
    .join(localeSeparator);
}

/**
 * Breaks a well-formed locale code into its parts.
 *
 * The BCP-47 standard and Unicode extensions allow for more variability that should be
 * added to this function once its supported in LangNav.
 */
export function parseLocaleCode(localeCode: string): LocaleTags {
  // Some examples of locale codes that should be parsed by this regex:
  // ca_VALENCIA
  // es_Latn_419_SPANGLIS
  // slv_Latn_SI_bohoric_nedis
  // taib1242_Hant_TW_tailo
  const parts = localeCode.match(
    /^([a-z]{2,3}|[a-z]{4}[0-9]{4})(?:[-_]([A-Z][a-z]{3}))?(?:[-_]([A-Z]{2}|[0-9]{3}))?(?:[-_]([-_A-Za-z0-9]{4,}))*$/,
  );
  if (!parts) {
    throw new Error(`Invalid locale code: ${localeCode}`);
  }
  return {
    languageCode: parts[1],
    scriptCode: parts[2],
    territoryCode: parts[3],
    variantTagCodes: parts[4] ? parts[4].toLowerCase().split(/[-_]/) : [],
  };
}
