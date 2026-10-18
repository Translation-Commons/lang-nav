import { computeDigitalSupportScores } from '@entities/language/digitalsupport/computeLanguageDigitalSupportScore';
import { LanguageData, LanguageSource } from '@entities/language/LanguageTypes';
import { getVitalityMetascore } from '@entities/language/vitality/LanguageVitalityComputation';

import averageCoordinates from '@shared/lib/averageCoordinates';
import { maxBy, maxOf } from '@shared/lib/setUtils';

/**
 * Compute derived vitality data for all languages, filling in gaps when it doesn't come
 * directly from a source.
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
  if (!lang.vitality) lang.vitality = {};

  // If it's declared by a source use that, otherwise use its children's max vitality
  if (lang.ISO.status != null) {
    lang.vitality.iso = lang.ISO.status;
  } else {
    lang.vitality.iso = maxOf(descendants, (child) => child.vitality?.iso);
  }

  // Propagate the endangerment of the largest child
  // If the largest child doesn't have it, then ignore it, usually the largest child should be the least endangered.
  // Endangerment data sometimes is available only for certain dialects so it may seem that the
  // language group may be endangered when the primary dialects are just fine.
  const biggestDescendant = maxBy(descendants, (child) => child.pop.overall);
  if (lang.Glottolog.endangerment != null) {
    lang.vitality.glottolog = lang.Glottolog.endangerment;
  } else {
    lang.vitality.glottolog = biggestDescendant?.vitality?.glottolog;
  }
  if (lang.UNESCO.endangerment != null) {
    lang.vitality.unesco = lang.UNESCO.endangerment;
  } else {
    lang.vitality.unesco = biggestDescendant?.vitality?.unesco;
  }

  // Compute the meta score and store the results in the language entity
  lang.vitality.meta = getVitalityMetascore(lang);

  // Compute the digital support scores
  lang.digitalSupportScore = computeDigitalSupportScores(lang);

  // Compute the lat/long coordinates
  computeCoordinates(lang);
}

/**
 * Compute the coordinates for a region based on the coordinates of the contained territories.
 *
 * Similar to computeRegionCoordinates used for territory groups
 *
 * Coordinates are weighted by the fourth root of the population
 */
function computeCoordinates(lang: LanguageData): void {
  if (lang.latitude != null && lang.longitude != null) return; // Don't override if coordinates already exist
  const children = lang.childLanguages ?? [];
  if (children.length === 0) return;
  const { latitude, longitude } = averageCoordinates(children);
  lang.latitude = latitude;
  lang.longitude = longitude;
  if (lang.latitude != null && lang.longitude != null) lang.coordsSource = LanguageSource.Combined;
}

export default computeRecursiveLanguageData;
