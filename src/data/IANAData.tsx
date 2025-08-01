import { unique } from '../generic/setUtils';
import {
  BCP47LocaleCode,
  LocaleData,
  PopulationSourceCategory,
  VariantTagData,
} from '../types/DataTypes';
import { LanguageDictionary, LanguagesBySource } from '../types/LanguageTypes';
import { ObjectType } from '../types/PageParamTypes';

export type VariantIANATag = string; // IANA tag, eg. valencia (for cat-ES-valencia)

export type VariantTagDictionary = Record<VariantIANATag, VariantTagData>;

export async function loadIANAVariants(): Promise<VariantTagDictionary | void> {
  return await fetch(`data/iana_variants.txt`)
    .then((res) => res.text())
    .then((rawData) => parseIANAVariants(rawData))
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

export function parseIANAVariants(input: string): VariantTagDictionary {
  const entries = input.split('%%');
  const variants: VariantTagDictionary = {};

  for (const entry of entries) {
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

    for (const line of entry.split('\n')) {
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

    if (data.Type[0] !== 'variant') continue; // Only process variants

    const ianaTag = data.Subtag[0];
    const name = data.Description.join(' '); // the Description is effectively the name
    // Extract prefixes (language codes) from the entry
    // Prefixes are usually language codes but can be composites like zh-Latn-pinyin or oc-lengadoc-grclass
    const languageCodes = unique(data.Prefix.map((l) => l.split(/\W/)[0]));
    const localeCodes = data.Prefix.map((l) => l + '-' + ianaTag);
    const added = data.Added[0] ? new Date(data.Added[0]) : undefined;

    if (ianaTag && name) {
      variants[ianaTag] = {
        type: ObjectType.VariantTag,
        ID: ianaTag,
        codeDisplay: ianaTag,
        nameDisplay: name,
        description: data.Comments.join(' '), // It's called comments but its functionally a description
        added,
        prefixes: data.Prefix,
        languageCodes: languageCodes,
        localeCodes: localeCodes,
        languages: [],
        locales: [],
        names: [name],
      };
    }
  }

  return variants;
}

// TODO support complex variants like zh-Latn-pinyin or oc-lengadoc-grclass
export function addIANAVariantLocales(
  languagesBySource: LanguagesBySource,
  locales: Record<BCP47LocaleCode, LocaleData>,
  variants: VariantTagDictionary | void,
): void {
  if (!variants) return;

  Object.values(variants).forEach((variant) => {
    variant.languageCodes.forEach((prefix) => {
      const cldrLang = languagesBySource.CLDR[prefix];
      if (!cldrLang) return;

      const iso639_3 = cldrLang.ID;
      const localeCode = `${prefix}_${variant.ID}`;

      locales[localeCode] = {
        ID: localeCode,
        languageCode: iso639_3,
        variantTagCode: variant.ID,
        nameDisplay: variant.nameDisplay,
        localeSource: 'IANA',
        codeDisplay: localeCode,
        type: ObjectType.Locale,
        populationSource: PopulationSourceCategory.NoSource,
        populationSpeaking: 0,
        censusRecords: [],
        territoryCode: '',
        names: [variant.nameDisplay],
      };
    });
  });
}

export function connectVariantTags(
  variantTags: VariantTagDictionary,
  languages: LanguageDictionary,
  locales: Record<BCP47LocaleCode, LocaleData>,
): void {
  // Link variants to languages and link languages back to variants
  Object.values(variantTags).forEach((variant) => {
    // Link languages to variants
    variant.languageCodes.forEach((langCode) => {
      const lang = languages[langCode];
      if (lang) {
        if (!variant.languages) variant.languages = [];
        variant.languages.push(lang);
        if (!lang.variantTags) lang.variantTags = [];
        lang.variantTags.push(variant);
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
    const { variantTagCode } = locale;
    if (!variantTagCode) return; // Skip if no variant tag ID
    const variant = variantTags[variantTagCode];
    if (!variant) {
      console.warn(`Variant tag ${variantTagCode} not found for locale ${locale.ID}`);
      return;
    }

    variant.locales.push(locale);
    locale.variantTag = variant;
  });
}
