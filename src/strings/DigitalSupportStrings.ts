import { EthnologueDigitalSupport } from '@entities/language/LanguageTypes';

// From https://www.ethnologue.com/methodology/#DLS
export function getDigitalSupportLabel(support?: EthnologueDigitalSupport): string | undefined {
  if (support == null) return undefined;
  switch (support) {
    case EthnologueDigitalSupport.Thriving:
      return 'Thriving';
    case EthnologueDigitalSupport.Vital:
      return 'Vital';
    case EthnologueDigitalSupport.Ascending:
      return 'Ascending';
    case EthnologueDigitalSupport.Emerging:
      return 'Emerging';
    case EthnologueDigitalSupport.Still:
      return 'Still';
  }
}

// From https://www.ethnologue.com/methodology/#DLS
export function getDigitalSupportDescription(
  support?: EthnologueDigitalSupport,
): string | undefined {
  if (support == null) return undefined;
  switch (support) {
    case EthnologueDigitalSupport.Thriving:
      return 'The language has all of the above plus virtual assistants.';
    case EthnologueDigitalSupport.Vital:
      return 'The language is supported by multiple tools in all of the above categories and has machine translation and speech processing as well.';
    case EthnologueDigitalSupport.Ascending:
      return 'The language has some spell checking and tools that have been localized as well.';
    case EthnologueDigitalSupport.Emerging:
      return 'The language has some content in digital form or some encoding tools.';
    case EthnologueDigitalSupport.Still:
      return 'The language shows no signs of digital support.';
  }
}
