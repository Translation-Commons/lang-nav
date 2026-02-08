import { LanguageData } from '@entities/language/LanguageTypes';
import { getVitalityMetascore } from '@entities/language/vitality/LanguageVitalityComputation';

import { maxBy } from '@shared/lib/setUtils';

/**
 * Compute derived vitality data for all languages, filling in gaps when it doesn't come
 * directly from a source. For example, Ethnologue doesn't provide vitality for language families
 * or macrolanguages.
 *
 * Re-run this when changing language parent/child relationships since language families may have
 * different compositions.
 */
function computeRecursiveLanguageData(languages: LanguageData[]): void {
  // For all language roots, recompute vitality scores
  languages
    .filter((lang) => lang.parentLanguage == null)
    .forEach((lang) => computeRecursiveDataOnLanguage(lang));
}

function computeRecursiveDataOnLanguage(lang: LanguageData, depth = 0): void {
  if (depth > 40) console.debug('Potential infinite recursion for: ', lang.ID, 'depth: ', depth);
  if (depth > 50) return;

  // Store the depth
  lang.depth = depth;

  // Recursively compute vitality for all descendants first
  const descendants = lang.childLanguages || [];
  descendants.forEach((child) => computeRecursiveDataOnLanguage(child, depth + 1));

  // Now compute vitality for this language
  const vitality = lang.vitality || {};
  const Ethnologue = lang.Ethnologue;

  // If it's declared by a source use that, otherwise use its children's max vitality
  if (lang.ISO.status != null) {
    vitality.iso = lang.ISO.status;
  } else {
    vitality.iso = maxBy(descendants, (child) => child.vitality?.iso);
  }
  if (Ethnologue.vitality2012 != null) {
    vitality.ethFine = Ethnologue.vitality2012;
  } else {
    vitality.ethFine = maxBy(descendants, (child) => child.vitality?.ethFine);
  }
  if (Ethnologue.vitality2025 != null) {
    vitality.ethCoarse = Ethnologue.vitality2025;
  } else {
    vitality.ethCoarse = maxBy(descendants, (child) => child.vitality?.ethCoarse);
  }

  // Compute the meta score and store the results in the language object
  vitality.meta = getVitalityMetascore(lang);
  lang.vitality = vitality;
}

export default computeRecursiveLanguageData;
