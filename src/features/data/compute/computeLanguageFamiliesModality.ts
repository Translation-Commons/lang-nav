import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import { sumBy } from '@shared/lib/setUtils';

function computeLanguageFamiliesModality(languages: LanguageData[]): void {
  // For each language family root
  languages
    .filter((lang) => !lang.parentLanguage)
    .forEach((lang) => computeModalityRecursively(lang));
}

function computeModalityRecursively(
  lang: LanguageData,
  depth: number = 0,
): LanguageModality | undefined {
  // Stop at dialects, we probably don't have a modality assigned to them
  if (lang.scope === LanguageScope.Dialect) return lang.modality; // probably undefined

  if (depth > 30) {
    console.warn(
      'computeRecursiveModality exceeded max depth of 30, possible circular reference for language',
      lang,
    );
    return undefined;
  }

  // Compute the modality of every language in the subtree
  lang.Combined.childLanguages?.map((child) => computeModalityRecursively(child, depth + 1));

  // If this language already has a modality (eg. assigned from data), respect that
  if (lang.modality != null) return lang.modality;

  // Otherwise, determine the combined modality from the the modality of its child nodes
  const combinedModality = determineCombinedModality(lang.Combined.childLanguages ?? []);
  lang.modality = combinedModality;
  return combinedModality;
}

function determineCombinedModality(langs: LanguageData[]): LanguageModality | undefined {
  if (langs.length === 0) return undefined;

  if (langs.length === 1 || langs.every((l) => l.modality === langs[0].modality)) {
    // All the same modality
    return langs[0].modality;
  }

  // If there are multiple modalities, we'll probably want spoken & written but we will convert it to a score since there is a
  // continuum of modalities.
  const totalPop = sumBy(langs, (lang) =>
    lang.modality != null ? (lang.populationEstimate ?? 0) : 0,
  );
  const score = sumBy(langs, (lang) => {
    const pop = lang.populationEstimate ?? 0;
    return (lang.modality ?? 0) * (pop / totalPop);
  });

  if (score >= 2.5) return LanguageModality.Sign;
  if (score >= 1.5) return LanguageModality.Spoken;
  if (score >= 0.5) return LanguageModality.MostlySpoken;
  if (score <= -1.5) return LanguageModality.Written;
  if (score <= -0.5) return LanguageModality.MostlyWritten;
  return LanguageModality.SpokenAndWritten;
}

export default computeLanguageFamiliesModality;
