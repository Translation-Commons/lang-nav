import { LocaleData, OfficialStatus } from '@entities/locale/LocaleTypes';

export function getLocaleName(locale: LocaleData, includeTerritory: boolean = true): string {
  const languageName = locale.language?.nameDisplay ?? locale.languageCode;
  const territoryName = includeTerritory
    ? (locale.territory?.nameDisplay ?? locale.territoryCode)
    : null;
  const scriptName = locale.writingSystem?.nameDisplay ?? locale.scriptCode;
  const variantNames =
    locale.variantTags?.map((tag) => tag.nameDisplay).join(', ') ??
    locale.variantTagCodes?.join(', ');
  const extraBits = [territoryName, scriptName, variantNames].filter(Boolean).join(', ');

  return extraBits ? languageName + ' (' + extraBits + ')' : languageName;
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
