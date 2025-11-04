import { VitalityEthnologueCoarse, VitalityEthnologueFine, VitalityISO } from './VitalityTypes';

export function getVitalityISOLabel(vitality: VitalityISO | undefined): string {
  switch (vitality) {
    case VitalityISO.Living:
      return 'Living';
    case VitalityISO.Constructed:
      return 'Constructed';
    case VitalityISO.Historical:
      return 'Historical';
    case VitalityISO.Extinct:
      return 'Extinct';
    case VitalityISO.SpecialCode:
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
