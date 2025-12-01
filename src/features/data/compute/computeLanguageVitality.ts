import { LanguageData } from '@entities/language/LanguageTypes';
import { getVitalityMetascore } from '@entities/language/vitality/LanguageVitalityComputation';

import { maxBy } from '@shared/lib/setUtils';

export function computeLanguageVitality(languages: LanguageData[]): void {
  // For all language roots, recompute vitality scores
  languages
    .filter((lang) => lang.parentLanguage == null)
    .forEach((rootLang) => {
      // Force recomputation of vitality by clearing cached value
      computeLanguageFamilyVitality(rootLang);
    });
}

function computeLanguageFamilyVitality(lang: LanguageData): void {
  // First check that its descendants all have vitality data
  const descendants = lang.childLanguages || [];
  // Recursively compute vitality for all descendants first
  descendants.forEach((child) => computeLanguageFamilyVitality(child));

  // Now compute vitality for this language
  const vitality = lang.vitality || {};
  const { ethnologue2013, ethnologue2025 } = vitality;

  // If it's declared by a source use that, otherwise use its children's max vitality
  if (lang.ISO.status != null) {
    vitality.iso = lang.ISO.status;
  } else {
    vitality.iso = maxBy(descendants, (child) => child.vitality?.iso);
  }
  if (ethnologue2013 != null) {
    vitality.ethFine = ethnologue2013;
  } else {
    vitality.ethFine = maxBy(descendants, (child) => child.vitality?.ethFine);
  }
  if (ethnologue2025 != null) {
    vitality.ethCoarse = ethnologue2025;
  } else {
    vitality.ethCoarse = maxBy(descendants, (child) => child.vitality?.ethCoarse);
  }

  // Compute the meta score and store the vitality
  vitality.meta = getVitalityMetascore(lang);
  lang.vitality = vitality;
}
