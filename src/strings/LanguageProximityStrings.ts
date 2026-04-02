import { LanguageProximityLevel } from '@entities/types/CLDRTypes';

export function getLanguageProximityFromString(
  input: string | undefined,
): LanguageProximityLevel | undefined {
  if (input == null) return undefined;
  switch (input.trim().toLowerCase()) {
    case 'high':
    case 'h':
      return LanguageProximityLevel.High;
    case 'medium':
    case 'm':
      return LanguageProximityLevel.Medium;
    case 'low':
    case 'l':
      return LanguageProximityLevel.Low;
  }
  return undefined;
}

export function getLanguageProximityDisplay(level: LanguageProximityLevel | undefined): string {
  switch (level) {
    case LanguageProximityLevel.High:
      return 'High';
    case LanguageProximityLevel.Medium:
      return 'Medium';
    case LanguageProximityLevel.Low:
      return 'Low';
    default:
      return '—';
  }
}
