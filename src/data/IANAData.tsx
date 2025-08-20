import { unique } from '../generic/setUtils';
import {
  BCP47LocaleCode,
  LocaleData,
  PopulationSourceCategory,
  VariantTagData,
} from '../types/DataTypes';
import { LanguageDictionary, LanguagesBySource } from '../types/LanguageTypes';
import { ObjectType } from '../types/PageParamTypes';

export type VariantIANATag = string; 

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
      if (line.trim() === '') continue; 
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
        default:
          data[lastKey].push(key.trim());
      }
    }

    if (data.Type[0] !== 'variant') continue; 
    const ianaTag = data.Subtag[0];
    const name = data.Description.join(' ');
    
    const languageCodes = unique(data.Prefix.map((l) => l.split(/\W/)[0]));
    const localeCodes = data.Prefix.map((l) => l + '-' + ianaTag);
    const dateAdded = data.Added[0] ? new Date(data.Added[0]) : undefined;

    if (ianaTag && name) {
      variants[ianaTag] = {
        type: ObjectType.VariantTag,
        ID: ianaTag,
        codeDisplay: ianaTag,
        nameDisplay: name,
        description: data.Comments.join(' '),
        dateAdded,
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

export function addIANAVariantLocales(
  languagesBySource: LanguagesBySource,
  locales: Record<BCP47LocaleCode, LocaleData>,
  variants: VariantTagDictionary | void,
): void {
  if (!variants) return;

  Object.values(variants).forEach((variant) => {
    variant.localeCodes.forEach((fullCode) => {
      
      const parts = fullCode.split('-');
      if (parts.length === 0) return;
      const languageSubtag = parts[0];
      const lang = languagesBySource.BCP[languageSubtag];
      if (!lang) return;
      const iso639_3 = lang.ID;

      let scriptCode: string | undefined = undefined;
      let regionCode = '';
      const variantSubtags: string[] = [];

      for (let i = 1; i < parts.length; i++) {
        const subtag = parts[i];
       
        if (!scriptCode && /^[A-Z][a-z]{3}$/.test(subtag)) {
          scriptCode = subtag;
          continue;
        }
       
        if (regionCode === '' && (/^[A-Z]{2}$/.test(subtag) || /^[0-9]{3}$/.test(subtag))) {
          regionCode = subtag;
          continue;
        }
       
        variantSubtags.push(subtag);
      }

     
      const localeCode = [iso639_3, scriptCode, regionCode, ...variantSubtags].filter(Boolean).join('_');

      
      if (!locales[localeCode]) {
        locales[localeCode] = {
          ID: localeCode,
          languageCode: iso639_3,
          territoryCode: regionCode,
          explicitScriptCode: scriptCode,
          variantTagCodes: variantSubtags.length > 0 ? variantSubtags : undefined,
          nameDisplay: variant.nameDisplay,
          localeSource: 'IANA',
          codeDisplay: localeCode,
          type: ObjectType.Locale,
          populationSource: PopulationSourceCategory.NoSource,
          populationSpeaking: 0,
          censusRecords: [],
          names: [variant.nameDisplay],
        };
      }
    });
  });
}

export function connectVariantTags(
  variantTags: VariantTagDictionary,
  languages: LanguageDictionary,
  locales: Record<BCP47LocaleCode, LocaleData>,
): void {
 
  Object.values(variantTags).forEach((variant) => {

    variant.languageCodes.forEach((langCode) => {
      const lang = languages[langCode];
      if (lang) {
        if (!variant.languages) variant.languages = [];
        variant.languages.push(lang);
        if (!lang.variantTags) lang.variantTags = [];
        lang.variantTags.push(variant);
      } else {
        
      }
    });
  });

  Object.values(locales).forEach((locale) => {
    const { variantTagCodes } = locale;
    if (!variantTagCodes || variantTagCodes.length === 0) return;

    const resolvedTags: VariantTagData[] = [];
    variantTagCodes.forEach((tagCode) => {
      const variant = variantTags[tagCode];
      if (!variant) {
        console.warn(`Variant tag ${tagCode} not found for locale ${locale.ID}`);
        return;
      }
     
      variant.locales.push(locale);
      resolvedTags.push(variant);
    });
    if (resolvedTags.length > 0) {
      locale.variantTags = resolvedTags;
     
      locale.variantTag = resolvedTags[0];
    }
  });
}
