import { LanguageData } from '../LanguageTypes';

import { LanguageISOStatus, VitalitySource } from './VitalityTypes';

export function getVitalityLabel(lang: LanguageData, source: VitalitySource): string | undefined {
  switch (source) {
    case VitalitySource.ISO:
      return getLanguageISOStatusLabel(lang.vitality?.iso);
    case VitalitySource.Metascore:
      return lang.vitality?.meta != null ? lang.vitality.meta.toFixed(1) : '—';
    default:
      return undefined;
  }
}

export function getLanguageISOStatusLabel(vitality: LanguageISOStatus | undefined): string {
  switch (vitality) {
    case LanguageISOStatus.Living:
      return 'Living';
    case LanguageISOStatus.Constructed:
      return 'Constructed';
    case LanguageISOStatus.Historical:
      return 'Historical';
    case LanguageISOStatus.Extinct:
      return 'Extinct';
    case LanguageISOStatus.SpecialCode:
      return 'Special Code';
    default:
      return 'Unknown';
  }
}
