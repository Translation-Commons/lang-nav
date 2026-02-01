import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from './VitalityTypes';

/**
 * Maps Ethnologue 2012 vitality levels to 0-9 scale
 *
 * The numbers come from the republication of this data in "Digital Language Death"
 * https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0077056#s4
 */
export function parseVitalityEthnologue2012(vitality: string): VitalityEthnologueFine | undefined {
  if (!vitality) return undefined;

  switch (vitality.toLowerCase()) {
    case 'international':
    // not found in data but listed on their website, intentionally falls through
    case 'national':
    case '1': // yes we flip the scores
      return VitalityEthnologueFine.National;
    case 'provincial':
    case 'regional':
    case '2':
      return VitalityEthnologueFine.Regional;
    case 'trade':
    case 'wider communication':
    case '3':
      return VitalityEthnologueFine.Trade;
    case 'educational':
    case '4':
      return VitalityEthnologueFine.Educational;
    case 'written':
    case 'developing':
    case '5':
      return VitalityEthnologueFine.Developing;
    case 'vigorous': // grouped with Threatened
    case '6':
    case 'threatened':
    case '6.5':
      return VitalityEthnologueFine.Threatened;
    case 'shifting':
    case '7':
      return VitalityEthnologueFine.Shifting;
    case 'moribund':
    case '8':
    case 'nearly extinct': // grouped with Moribund
    case '8.5':
      return VitalityEthnologueFine.Moribund;
    case 'dormant':
    case '9':
      return VitalityEthnologueFine.Dormant;
    case 'extinct':
    case '10':
      return VitalityEthnologueFine.Extinct;
    case '7.7': // not in Ethnologue dataset, from Digital Language Death paper
      return undefined;
    default:
      console.debug(`Unknown vitality string: ${vitality}`);
      return undefined;
  }
}

/**
 * Maps Ethnologue 2025 vitality levels to 0-9 scale
 */
export function parseVitalityEthnologue2025(
  vitality: string,
): VitalityEthnologueCoarse | undefined {
  if (!vitality) return undefined;

  switch (vitality.toLowerCase()) {
    case 'institutional':
      return VitalityEthnologueCoarse.Institutional;
    case 'stable':
      return VitalityEthnologueCoarse.Stable;
    case 'endangered':
      return VitalityEthnologueCoarse.Endangered;
    case 'extinct':
      return VitalityEthnologueCoarse.Extinct;
    default:
      console.debug(`Unknown coarse vitality string: ${vitality}`);
      return undefined;
  }
}

/**
 * Maps ISO vitality levels to 0-9 scale
 */
export function parseLanguageISOStatus(vitality: string): LanguageISOStatus | undefined {
  if (!vitality) return undefined;

  switch (vitality.toLowerCase()) {
    case 'living':
    case 'l':
      return LanguageISOStatus.Living;
    case 'constructed':
    case 'c':
      return LanguageISOStatus.Constructed;
    case 'historical':
    case 'historic':
    case 'h':
      return LanguageISOStatus.Historical;
    case 'extinct':
    case 'e':
      return LanguageISOStatus.Extinct;
    case 'special code':
    case 'specialcode':
    case 's':
      return LanguageISOStatus.SpecialCode;
    default:
      return undefined;
  }
}
