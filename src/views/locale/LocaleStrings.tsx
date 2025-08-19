import { ISO3166Code, LocaleData, OfficialStatus } from '../../types/DataTypes';
import { LocaleSeparator } from '../../types/PageParamTypes';

export function getLocaleName(locale: LocaleData): string {
  const languageName = locale.language?.nameDisplay ?? locale.languageCode;
  const territoryName = locale.territory?.nameDisplay ?? locale.territoryCode;
  const scriptName = locale.writingSystem?.nameDisplay ?? locale.explicitScriptCode;

  let variantName: string | undefined = undefined;
  if (locale.variantTags && locale.variantTags.length > 0) {
    variantName = locale.variantTags.map((v) => v.nameDisplay).join(', ');
  } else if (locale.variantTagCodes && locale.variantTagCodes.length > 0) {
    variantName = locale.variantTagCodes.join(', ');
  }

  return languageName + ' (' + [territoryName, scriptName, variantName].filter(Boolean).join(', ') + ')';
}

export function getLocaleCode(
  locale: LocaleData,
  localeSeparator: LocaleSeparator,
  territoryOverride?: ISO3166Code,
): string {
  const components: string[] = [];
 
  components.push(locale.language?.codeDisplay ?? locale.languageCode);
  if (locale.explicitScriptCode) components.push(locale.explicitScriptCode);
  const territory = territoryOverride ?? locale.territoryCode;
  if (territory) components.push(territory);
  // Include all variant subtags
  if (locale.variantTagCodes && locale.variantTagCodes.length > 0) {
    components.push(...locale.variantTagCodes);
  }
  return components.filter(Boolean).join(localeSeparator);
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
