import { LanguageData } from '../LanguageTypes';

import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
  VitalitySource,
} from './VitalityTypes';

export function getVitalityLabel(lang: LanguageData, source: VitalitySource): string | undefined {
  switch (source) {
    case VitalitySource.ISO:
      return getLanguageISOStatusLabel(lang.vitality?.iso);
    case VitalitySource.Eth2012:
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

// Explanations from https://www.ethnologue.com/methodology/#Status
export function getVitalityEthnologueFineDescription(
  vitality: VitalityEthnologueFine | undefined,
): string {
  switch (vitality) {
    // case VitalityEthnologueFine.International:
    //   return 'The language is widely used between nations in trade, knowledge exchange, and international policy.';
    case VitalityEthnologueFine.National:
      return 'The language is used in education, work, mass media, and government at the national level.';
    case VitalityEthnologueFine.Regional:
      return 'The language is used in education, work, mass media, and government within major administrative subdivisions of a nation.';
    // case VitalityEthnologueFine.WiderCommunication:
    case VitalityEthnologueFine.Trade:
      return 'The language is used in work and mass media without official status to transcend language differences across a region.';
    case VitalityEthnologueFine.Educational:
      return 'The language is in vigorous use, with standardization and literature being sustained through a widespread system of institutionally supported education.';
    case VitalityEthnologueFine.Developing:
      return 'The language is in vigorous use, with literature in a standardized form being used by some though this is not yet widespread or sustainable.';
    // case VitalityEthnologueFine.Vigorous:
    //   return 'The language is used for face-to-face communication by all generations and the situation is sustainable.';
    case VitalityEthnologueFine.Threatened:
      return 'The language is used for face-to-face communication within all generations, but it is losing users.';
    case VitalityEthnologueFine.Shifting:
      return 'The child-bearing generation can use the language among themselves, but it is not being transmitted to children.';
    case VitalityEthnologueFine.Moribund:
      return 'The only remaining active users of the language are members of the grandparent generation and older.';
    // case VitalityEthnologueFine.NearlyExtinct:
    //   return 'The only remaining users of the language are members of the grandparent generation or older who have little opportunity to use the language.';
    case VitalityEthnologueFine.Dormant:
      return 'The language serves as a reminder of heritage identity for an ethnic community, but no one has more than symbolic proficiency.';
    case VitalityEthnologueFine.Extinct:
      return 'The language is no longer used and no one retains a sense of ethnic identity associated with the language.';
    default:
      return 'No description available.';
  }
}

// Explanations from https://www.ethnologue.com/insights/classifying-language-status/#
export function getVitalityEthnologueCoarseDescription(
  vitality: VitalityEthnologueCoarse | undefined,
): string {
  switch (vitality) {
    case VitalityEthnologueCoarse.Institutional:
      return 'Official usage within government, trade, and education.';
    case VitalityEthnologueCoarse.Stable:
      return 'Widespread social use within communities across all age ranges.';
    case VitalityEthnologueCoarse.Endangered:
      return `The natural "Parent teaching Child" process is weakening or has ceased.`;
    case VitalityEthnologueCoarse.Extinct:
      return 'Ceased to exist within the last 200 years or so.';
    default:
      return 'No description available.';
  }
}
