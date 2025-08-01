import { ISO3166Code, LocaleData, OfficialStatus } from '../../types/DataTypes';
import { LocaleSeparator } from '../../types/PageParamTypes';

export function getLocaleName(locale: LocaleData): string {
  const languageName = locale.language?.nameDisplay ?? locale.languageCode;
  const territoryName = locale.territory?.nameDisplay ?? locale.territoryCode;
  const scriptName = locale.writingSystem?.nameDisplay ?? locale.explicitScriptCode;
  const variantName = locale.variantTag?.nameDisplay ?? locale.variantTagCode;

  return (
    languageName + ' (' + [territoryName, scriptName, variantName].filter(Boolean).join(', ') + ')'
  );
}

export function getLocaleCode(
  locale: LocaleData,
  localeSeparator: LocaleSeparator,
  territoryOverride?: ISO3166Code,
): string {
  return [
    locale.language?.codeDisplay ?? locale.languageCode,
    locale.explicitScriptCode,
    territoryOverride ?? locale.territoryCode,
    locale.variantTagCode, // TODO a locale could have multiple variant tags
  ]
    .filter(Boolean)
    .join(localeSeparator);
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
