import type { LanguageData } from '../LanguageTypes';

import { GlottologEndangerment, LanguageISOStatus, VitalitySource } from './VitalityTypes';

export function getVitalityLabel(lang: LanguageData, source: VitalitySource): string | undefined {
  switch (source) {
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

export function parseEndangerment(input: string): GlottologEndangerment | undefined {
  switch (input.toLowerCase().replace(' ', '')) {
    case 'safe':
      return GlottologEndangerment.Safe;
    case 'vulnerable':
      return GlottologEndangerment.Vulnerable;
    case 'definitelyendangered':
      return GlottologEndangerment.DefinitelyEndangered;
    case 'severelyendangered':
      return GlottologEndangerment.SeverelyEndangered;
    case 'criticallyendangered':
      return GlottologEndangerment.CriticallyEndangered;
    case 'extinct':
      return GlottologEndangerment.Extinct;
    default:
      return undefined;
  }
}

export function getEndangermentLabel(endangerment: GlottologEndangerment | undefined): string {
  switch (endangerment) {
    case GlottologEndangerment.Safe:
      return 'Safe';
    case GlottologEndangerment.Vulnerable:
      return 'Vulnerable';
    case GlottologEndangerment.DefinitelyEndangered:
      return 'Definitely Endangered';
    case GlottologEndangerment.SeverelyEndangered:
      return 'Severely Endangered';
    case GlottologEndangerment.CriticallyEndangered:
      return 'Critically Endangered';
    case GlottologEndangerment.Extinct:
      return 'Extinct';
    default:
      return 'Unknown';
  }
}
