import { LocaleSeparator, ObjectType } from '@features/params/PageParamTypes';

import { LanguageDictionary } from '@entities/language/LanguageTypes';
import { getLocaleCodeFromTags, LocaleTags, parseLocaleCode } from '@entities/locale/LocaleParsing';
import { LocaleData, LocaleSource, StandardLocaleCode } from '@entities/locale/LocaleTypes';
import { VariantData, VariantDictionary } from '@entities/variant/VariantTypes';

import { toDictionary, unique } from '@shared/lib/setUtils';

export async function loadIANAVariants(): Promise<VariantDictionary | void> {
  return await fetch(`data/iana_variants.txt`)
    .then((res) => res.text())
    .then((text) => text.split('%%'))
    .then((variantBlocks) => variantBlocks.map(parseIANAVariant))
    .then((variants) => variants.filter((v) => v !== null))
    .then((variants) => toDictionary(variants, (v) => v.ID))
    .catch((err) => console.error('Error loading TSV:', err));
}

enum IANAVariantKey {
  Type = 'Type',
  Subtag = 'Subtag',
  Added = 'Added',
  Description = 'Description',
  Prefix = 'Prefix',
  Comments = 'Comments',
}

export function parseIANAVariant(input: string): VariantData | null {
  ////// Example data:
  // Type: variant
  // Subtag: baku1926
  // Description: Unified Turkic Latin Alphabet (Historical)
  // Added: 2007-04-18
  // Prefix: az
  // Prefix: ba
  // Prefix: crh
  // Prefix: kk
  // Prefix: krc
  // Prefix: ky
  // Prefix: sah
  // Prefix: tk
  // Prefix: tt
  // Prefix: uz
  // Comments: Denotes alphabet used in Turkic republics/regions of the
  //   former USSR in late 1920s, and throughout 1930s, which aspired to
  //   represent equivalent phonemes in a unified fashion. Also known as: New
  //   Turkic Alphabet; Birlәşdirilmiş Jeni Tyrk
  //   Әlifbasь (Birlesdirilmis Jeni Tyrk Elifbasi);
  //   Jaŋalif (Janalif).

  // Iterate through the lines, filling in new values or
  const data: Record<IANAVariantKey, string[]> = {
    [IANAVariantKey.Type]: [],
    [IANAVariantKey.Subtag]: [],
    [IANAVariantKey.Added]: [],
    [IANAVariantKey.Description]: [],
    [IANAVariantKey.Prefix]: [],
    [IANAVariantKey.Comments]: [],
  };
  let lastKey: IANAVariantKey = IANAVariantKey.Type;

  for (const line of input.split('\n')) {
    if (line.trim() === '') continue; // Skip empty lines
    const [key, value] = line.split(':');
    switch (key) {
      case IANAVariantKey.Type:
      case IANAVariantKey.Subtag:
      case IANAVariantKey.Added:
      case IANAVariantKey.Prefix:
      case IANAVariantKey.Description:
      case IANAVariantKey.Comments:
        data[key as IANAVariantKey].push(value.trim());
        lastKey = key as IANAVariantKey;
        break;
      default: // there is no field, its just appended to the prior field like for comments
        data[lastKey].push(key.trim());
    }
  }

  if (data.Type[0] !== 'variant') return null; // Only process variants

  const ianaTag = data.Subtag[0];
  const name = data.Description.join(' '); // the Description is effectively the name
  // Extract prefixes (language codes) from the entry
  // Prefixes are usually language codes but can be composites like zh-Latn-pinyin or oc-lengadoc-grclass
  const languageCodes = unique(data.Prefix.map((l) => l.split(/\W/)[0]));
  const localeCodes = data.Prefix.map((l) => l + '-' + ianaTag);
  const dateAdded = data.Added[0] ? new Date(data.Added[0]) : undefined;

  if (ianaTag && name) {
    return {
      type: ObjectType.Variant,
      ID: ianaTag,
      codeDisplay: ianaTag,
      nameDisplay: name,
      description: data.Comments.join(' '), // It's called comments but its functionally a description
      dateAdded,
      prefixes: data.Prefix,
      languageCodes: languageCodes,
      localeCodes: localeCodes,
      languages: [],
      locales: [],
      names: [name],
    };
  }
  return null;
}

// TODO support complex variants like zh-Latn-pinyin or oc-lengadoc-grclass
export function addIANAVariantLocales(
  languagesBCP: LanguageDictionary,
  locales: Record<StandardLocaleCode, LocaleData>,
  variants: VariantDictionary | void,
): void {
  if (!variants) return;

  Object.values(variants).forEach((variant) => {
    variant.prefixes.forEach((prefix) => {
      if (prefix === 'sgn-ase') return; // known bad data

      const localeParts = parseLocaleCode(prefix);
      const iso639_3 = languagesBCP[localeParts.languageCode]?.ID;
      if (!iso639_3) return; // Shouldn't happen, but just in case
      localeParts.languageCode = iso639_3;

      // Add both the variant's prefix and the prefix with the variant to the locale list if it isn't yet present
      addVariantLocale(localeParts, locales);
      addVariantLocale(
        { ...localeParts, variantCodes: [...(localeParts.variantCodes ?? []), variant.ID] },
        locales,
      );
    });
  });
}

function addVariantLocale(
  localeTags: LocaleTags,
  locales: Record<StandardLocaleCode, LocaleData>,
): void {
  const localeCode = getLocaleCodeFromTags(localeTags, LocaleSeparator.Underscore);
  if (!localeCode.includes('_')) return; // Don't add language-only locales
  if (locales[localeCode]) return; // Already exists

  locales[localeCode] = {
    type: ObjectType.Locale,
    ID: localeCode,
    codeDisplay: localeCode,
    ...localeTags, // languageCode, scriptCode, territoryCode, variantCodes
    localeSource: LocaleSource.IANA,

    // Names are withheld but they are added later when all of the locale objects have been linked
    nameDisplay: '',
    names: [],
  };
}

export function connectVariants(
  variants: VariantDictionary,
  languages: LanguageDictionary,
  locales: Record<StandardLocaleCode, LocaleData>,
): void {
  // Link variants to languages and link languages back to variants
  Object.values(variants).forEach((variant) => {
    // Link languages to variants
    variant.languageCodes.forEach((langCode) => {
      const lang = languages[langCode];
      if (lang) {
        if (!variant.languages) variant.languages = [];
        variant.languages.push(lang);
        if (!lang.variants) lang.variants = [];
        lang.variants.push(variant);
      } else {
        // Known missing languages from CLDR
        // tw (variants akuapem, asante)
        // sgn (variant blasl)
        // console.warn(`Language code ${langCode} not found for variant ${variant.ID}`);
      }
    });
  });

  // Link locales to variants and vice versa
  Object.values(locales).forEach((locale) => {
    const { variantCodes } = locale;
    if (!variantCodes || variantCodes.length === 0) return; // Skip if no variant tag ID

    variantCodes.forEach((variantCode) => {
      const variant = variants[variantCode];
      if (!variant) {
        console.warn(`Variant tag ${variantCode} not found for locale ${locale.ID}`);
        return;
      }

      variant.locales.push(locale);
      if (!locale.variants) locale.variants = [];
      locale.variants.push(variant);
    });
  });
}
