import { LanguageData } from '@entities/language/LanguageTypes';
import { VariantData } from '@entities/variant/VariantTypes';

import { getVariantTypeFromString } from '@strings/VariantStrings';

export async function loadVariantAnnotations(
  getVariant: (id: string) => VariantData | undefined,
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  await fetch('data/tc/variant_annotations.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1) // Remove the header row
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) =>
      lines.forEach((line) => {
        const parts = line.split('\t');
        const variant = getVariant(parts[0]);
        if (!variant || parts.length < 2) return;
        variant.variantType = getVariantTypeFromString(parts[1]);
        if (parts.length >= 3 && parts[2].trim()) {
          variant.languoidCode = parts[2].trim();
          variant.languoid = getLanguage(variant.languoidCode);
          if (variant.languoid && variant.languoidCode !== 'mis') {
            variant.languoid.variants?.push(variant);
          }
        }
      }),
    );
}
