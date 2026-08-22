import { DigitalSupportDimension } from '@entities/language/digitalsupport/DigitalSupportTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

export function getDigitalSupportDimensionLabel(dimension: DigitalSupportDimension): string {
  switch (dimension) {
    case DigitalSupportDimension.Overall:
      return 'Overall';
    case DigitalSupportDimension.Keyboards:
      return 'Keyboards';
    case DigitalSupportDimension.Documentation:
      return 'Documentation';
    case DigitalSupportDimension.I18nFrameworks:
      return 'I18n Frameworks';
    case DigitalSupportDimension.MachineTranslation:
      return 'Machine Translation';
    case DigitalSupportDimension.Interfaces:
      return 'Interfaces';
    default:
      enforceExhaustiveSwitch(dimension);
  }
}
