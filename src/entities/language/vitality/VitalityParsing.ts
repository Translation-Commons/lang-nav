import { LanguageISOStatus } from './VitalityTypes';

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
