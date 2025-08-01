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

export function parseIANAVariants(input: string): VariantTagDictionary {
  const entries = input.split('%%');
  const variants: VariantTagDictionary = {};

  for (const entry of entries) {
    const lines = entry
      .trim()
      .split('\n')
      .map((l) => l.trim());
    const typeLine = lines.find((l) => l.startsWith('Type:'));
    if (!typeLine || !typeLine.includes('variant')) continue;

    const tag = entry.match(/Subtag:\s*(\S+)/)?.[1];
    const name = lines
      .find((l) => l.startsWith('Description:'))
      ?.replace('Description:', '')
      .trim();
    const comment = lines
      .find((l) => l.startsWith('Comment:'))
      ?.replace('Comment:', '')
      .trim();

    // Extract prefixes (language codes) from the entry
    // Prefixes are usually language codes but can be composites like zh-Latn-pinyin
    // or oc-lengadoc-grclass
    const prefixes = lines
      .filter((l) => l.startsWith('Prefix:'))
      .map((l) => l.replace('Prefix:', '').trim());
    const languageCodes = unique(prefixes.map((l) => l.split(/\W/)[0]));

    if (tag && name) {
      variants[tag] = {
        type: ObjectType.VariantTag,
        ID: tag,
        codeDisplay: tag,
        nameDisplay: name,
        description: comment,
        prefixes: prefixes,
        languageCodes: languageCodes,
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
