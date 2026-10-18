import type { LanguageData } from '../LanguageTypes';

import { LanguageISOStatus, UNESCOEndangerment, VitalitySource } from './VitalityTypes';

export function getVitalityLabel(lang: LanguageData, source: VitalitySource): string | undefined {
  switch (source) {
    case VitalitySource.UNESCO:
      return getEndangermentLabel(lang.vitality?.unesco);
    case VitalitySource.Glottolog:
      return getEndangermentLabel(lang.vitality?.glottolog);
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

export function parseEndangerment(input: string): UNESCOEndangerment | undefined {
  switch (input.toLowerCase().replace(' ', '')) {
    case 'safe':
      return UNESCOEndangerment.Safe;
    case 'vulnerable':
      return UNESCOEndangerment.Vulnerable;
    case 'definitelyendangered':
      return UNESCOEndangerment.DefinitelyEndangered;
    case 'severelyendangered':
      return UNESCOEndangerment.SeverelyEndangered;
    case 'criticallyendangered':
      return UNESCOEndangerment.CriticallyEndangered;
    case 'extinct':
      return UNESCOEndangerment.Extinct;
    default:
      return undefined;
  }
}

export function getEndangermentLabel(endangerment: UNESCOEndangerment | undefined): string {
  switch (endangerment) {
    case UNESCOEndangerment.Safe:
      return 'Safe';
    case UNESCOEndangerment.Vulnerable:
      return 'Vulnerable';
    case UNESCOEndangerment.DefinitelyEndangered:
      return 'Definitely Endangered';
    case UNESCOEndangerment.SeverelyEndangered:
      return 'Severely Endangered';
    case UNESCOEndangerment.CriticallyEndangered:
      return 'Critically Endangered';
    case UNESCOEndangerment.Extinct:
      return 'Extinct';
    default:
      return 'Unknown';
  }
}
