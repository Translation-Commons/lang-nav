import { LocaleData, OfficialStatus } from '../../types/DataTypes';

export function getLocaleName(locale: LocaleData): string {
  const languageName = locale.language?.nameDisplay ?? locale.languageCode;
  const territoryName = locale.territory?.nameDisplay ?? locale.territoryCode;
  const scriptName = locale.writingSystem != null ? locale.writingSystem.nameDisplay : null;
  const variantName = locale.variantTag != '' ? locale.variantTag : null;

  return (
    languageName + ' (' + [territoryName, scriptName, variantName].filter(Boolean).join(', ') + ')'
  );
}

export function getOfficialLabel(officialStatus: OfficialStatus): string {
  switch (officialStatus) {
    case OfficialStatus.Official:
      return 'Official';
    case OfficialStatus.DeFactoOfficial:
      return 'Official (de facto)';
    case OfficialStatus.Recognized:
      return 'Recognized';
    case OfficialStatus.OfficialRegionally:
      return 'Official in a Region';
    case OfficialStatus.RecognizedRegionally:
      return 'Recognized in a Region';
    default:
      return 'None';
  }
}
