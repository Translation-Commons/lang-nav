import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { LanguageModality } from '../LanguageModality';

/**
 * When computing population numbers, sometimes sources report general numbers (eg. Population: 314,000)
 * When starting with ambiguous data, we apply a discount to the population number based on how it is commonly used.
 *
 * Languages that have lively spoken & written traditions are counted fully, while languages that are mostly spoken or mostly written are discounted for the modality that is not commonly used.
 *
 * @param modality The language's modality (spoken, written, sign, etc.)
 * @param use The modality for which we are computing the population (speaking or writing)
 * @returns A discount factor to apply to the population number for the given modality
 */
function getLanguageModalityDiscount(
  modality: LanguageModality | undefined,
  use: 'speaking' | 'writing',
): number {
  if (modality == null) return 1.0; // No discount for unknown modality
  switch (modality) {
    case LanguageModality.Sign:
      return use === 'speaking' ? 1 : 0; // Sign languages are not directly written, they are grouped with "speaking" for informal contexts
    case LanguageModality.Spoken:
      return use === 'speaking' ? 1 : 0; // Spoken languages may have written forms, but no common written tradition
    case LanguageModality.MostlySpoken:
      return use === 'speaking' ? 1 : 0.1; // Mostly spoken languages may have some written forms, but not widely used
    case LanguageModality.SpokenAndWritten:
      return 1.0; // No discount applied
    case LanguageModality.MostlyWritten:
      return use === 'speaking' ? 0.1 : 0; // It's mostly used in writing (eg. Latin for academics or church), so while it technically can be spoken we discount it heavily
    case LanguageModality.Written:
      return use === 'speaking' ? 0 : 1; // This is not a language that is spoken, it is only written, so no population should be counted for speaking
    default:
      enforceExhaustiveSwitch(modality);
  }
}

export default getLanguageModalityDiscount;
