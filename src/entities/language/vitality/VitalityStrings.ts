import { LanguageData } from '../LanguageTypes';

import {
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
  LanguageISOStatus,
  VitalitySource,
} from './VitalityTypes';

export function getVitalityLabel(lang: LanguageData, source: VitalitySource): string | undefined {
  switch (source) {
    case VitalitySource.ISO:
      return getLanguageISOStatusLabel(lang.vitality?.iso);
    case VitalitySource.Eth2013:
      return getVitalityEthnologueFineLabel(lang.vitality?.ethFine);
    case VitalitySource.Eth2025:
      return getVitalityEthnologueCoarseLabel(lang.vitality?.ethCoarse);
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

export function getVitalityEthnologueFineLabel(
  vitality: VitalityEthnologueFine | undefined,
): string {
  switch (vitality) {
    case VitalityEthnologueFine.National:
      return 'National';
    case VitalityEthnologueFine.Regional:
      return 'Regional';
    case VitalityEthnologueFine.Trade:
      return 'Trade';
    case VitalityEthnologueFine.Educational:
      return 'Educational';
    case VitalityEthnologueFine.Developing:
      return 'Developing';
    case VitalityEthnologueFine.Threatened:
      return 'Threatened';
    case VitalityEthnologueFine.Shifting:
      return 'Shifting';
    case VitalityEthnologueFine.Moribund:
      return 'Moribund';
    case VitalityEthnologueFine.Dormant:
      return 'Dormant';
    case VitalityEthnologueFine.Extinct:
      return 'Extinct';
    default:
      return 'Unknown';
  }
}

export function getVitalityEthnologueCoarseLabel(
  vitality: VitalityEthnologueCoarse | undefined,
): string {
  switch (vitality) {
    case VitalityEthnologueCoarse.Institutional:
      return 'Institutional';
    case VitalityEthnologueCoarse.Stable:
      return 'Stable';
    case VitalityEthnologueCoarse.Endangered:
      return 'Endangered';
    case VitalityEthnologueCoarse.Extinct:
      return 'Extinct';
    default:
      return 'Unknown';
  }
}
