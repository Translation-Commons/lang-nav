import { ScopeLevel, LocaleStub, LanguageSchemas } from './Types';
import { readTextFile } from './Util';

export interface IANAVariantData {
  tag: string;
  name: string;
  prefixes: string[];
}

export async function loadIANAVariants(): Promise<IANAVariantData[]> {
  const rawData = await readTextFile('data/iana_variants.txt');
  return parseIANAVariants(rawData);
}

export function parseIANAVariants(input: string): IANAVariantData[] {
  const entries = input.split('%%');
  const variants: IANAVariantData[] = [];

  for (const entry of entries) {
    const lines = entry.trim().split('\n').map(l => l.trim());
    const typeLine = lines.find(l => l.startsWith('Type:'));
    if (!typeLine || !typeLine.includes('variant')) continue;

    const tagLine = lines.find(l => l.startsWith('Subtag:'));
    const descLine = lines.find(l => l.startsWith('Description:'));
    const prefixLines = lines.filter(l => l.startsWith('Prefix:'));

    if (tagLine && descLine && prefixLines.length > 0) {
      const tag = tagLine.replace('Subtag:', '').trim();
      const name = descLine.replace('Description:', '').trim();
      const prefixes = prefixLines.map(l => l.replace('Prefix:', '').trim());

      variants.push({ tag, name, prefixes });
    }
  }

  return variants;
}

export async function addIANAVariantLocales(
  languagesBySchema: LanguageSchemas,
  locales: Record<string, LocaleStub>
): Promise<void> {
  const variants = await loadIANAVariants();

  for (const variant of variants) {
    for (const prefix of variant.prefixes) {
      const cldrLang = languagesBySchema.CLDR[prefix];
      if (!cldrLang) continue;

      const iso639_3 = cldrLang.ID;
      const localeCode = `${prefix}_${variant.tag}`;

      locales[localeCode] = {
        ID: localeCode,
        Language: iso639_3,
        Variant: variant.tag,
        Name: variant.name,
        Scope: ScopeLevel.Parts,
        Canonical: false,
      };
    }
  }
}

