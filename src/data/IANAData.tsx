import { LocaleData, PopulationSourceCategory, VariantTagData } from '../types/DataTypes';
import { LanguagesBySource } from '../types/LanguageTypes';
import { ObjectType } from '../types/PageParamTypes';

export interface IANAVariantData {
  tag: string;
  name: string;
  prefixes: string[];
}

export async function loadIANAVariants(): Promise<IANAVariantData[] | void> {
  return await fetch(`data/iana_variants.txt`)
    .then((res) => res.text())
    .then((rawData) => parseIANAVariants(rawData))
    .catch((err) => console.error('Error loading TSV:', err));
}

export function convertToVariantTagData(variants: IANAVariantData[]): VariantTagData[] {
  return variants.map((variant) => ({
    type: ObjectType.VariantTag,
    ID: variant.tag,
    codeDisplay: variant.tag,
    nameDisplay: variant.name,
    description: '', // optional enhancement: add multiple Descriptions
    associatedLanguageCodes: variant.prefixes,
    languages: [],
    locales: [],
    names: [variant.name],
  }));
}

export function parseIANAVariants(input: string): IANAVariantData[] {
  const entries = input.split('%%');
  const variants: IANAVariantData[] = [];

  for (const entry of entries) {
    const lines = entry
      .trim()
      .split('\n')
      .map((l) => l.trim());
    const typeLine = lines.find((l) => l.startsWith('Type:'));
    if (!typeLine || !typeLine.includes('variant')) continue;

    const tagLine = lines.find((l) => l.startsWith('Subtag:'));
    const descLine = lines.find((l) => l.startsWith('Description:'));
    const prefixLines = lines.filter((l) => l.startsWith('Prefix:'));

    if (tagLine && descLine && prefixLines.length > 0) {
      const tag = tagLine.replace('Subtag:', '').trim();
      const name = descLine.replace('Description:', '').trim();
      const prefixes = prefixLines.map((l) => l.replace('Prefix:', '').trim());

      variants.push({ tag, name, prefixes });
    }
  }

  return variants;
}

export function addIANAVariantLocales(
  languagesBySource: LanguagesBySource,
  locales: Record<string, LocaleData>,
  variants: IANAVariantData[] | void,
): void {
  if (!variants) return;

  for (const variant of variants) {
    for (const prefix of variant.prefixes) {
      const cldrLang = languagesBySource.CLDR[prefix];
      if (!cldrLang) continue;

      const iso639_3 = cldrLang.ID;
      const localeCode = `${prefix}_${variant.tag}`;

      locales[localeCode] = {
        ID: localeCode,
        languageCode: iso639_3,
        variantTagID: variant.tag,
        nameDisplay: variant.name,
        localeSource: 'IANA',
        codeDisplay: localeCode,
        type: ObjectType.Locale,
        populationSource: PopulationSourceCategory.NoSource,
        populationSpeaking: 0,
        censusRecords: [],
        territoryCode: '',
        names: [variant.name],
      };
    }
  }
}
