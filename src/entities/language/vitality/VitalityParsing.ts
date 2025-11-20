import {
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
  LanguageISOStatus,
} from './VitalityTypes';

/**
 * Maps Ethnologue 2013 vitality levels to 0-9 scale
 */
export function parseVitalityEthnologue2013(vitality: string): VitalityEthnologueFine | undefined {
  if (!vitality) return undefined;

  switch (vitality.toLowerCase()) {
    case 'national':
      return VitalityEthnologueFine.National;
    case 'provincial':
    case 'regional':
      return VitalityEthnologueFine.Regional;
    case 'trade':
    case 'wider communication':
      return VitalityEthnologueFine.Trade;
    case 'educational':
      return VitalityEthnologueFine.Educational;
    case 'written':
    case 'developing':
      return VitalityEthnologueFine.Developing;
    case 'vigorous':
    case 'threatened':
      return VitalityEthnologueFine.Threatened;
    case 'shifting':
      return VitalityEthnologueFine.Shifting;
    case 'moribund':
    case 'nearly extinct':
      return VitalityEthnologueFine.Moribund;
    case 'dormant':
      return VitalityEthnologueFine.Dormant;
    case 'extinct':
      return VitalityEthnologueFine.Extinct;
    default:
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
