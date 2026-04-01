import { ECRMLProtectionLevel, LocaleData, OfficialStatus } from '@entities/locale/LocaleTypes';

export function getLocaleName(locale: LocaleData, includeTerritory: boolean = true): string {
  const languageName = locale.language?.nameDisplay ?? locale.languageCode;
  const territoryName = includeTerritory
    ? (locale.territory?.nameDisplay ?? locale.territoryCode)
    : null;
  const scriptName = locale.writingSystem?.nameDisplay ?? locale.scriptCode;
  const variantNames =
    locale.variants?.map((tag) => tag.nameDisplay).join(', ') ?? locale.variantCodes?.join(', ');
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

export function parseECRMLProtectionLevel(
  protectionLevel: string | undefined,
): ECRMLProtectionLevel | undefined {
  if (!protectionLevel) return undefined;

  switch (protectionLevel.trim()) {
    case 'Part II (Article 7.5)':
      return ECRMLProtectionLevel.DispersedLanguageSupport;
    case 'Part II (Article 7) or Part II (Article 7) and Part III (Articles 8-14)':
      return ECRMLProtectionLevel.RegionSpecificRights;
    case 'Part II (Article 7) and Part III (Articles 8-14)':
      return ECRMLProtectionLevel.ComprehensiveProtection;
    case 'Part II (Article 7)':
      return ECRMLProtectionLevel.CulturalRecognition;
    default:
      return undefined;
  }
}

export function getEcrmlTitle(
  protectionLevel: ECRMLProtectionLevel | undefined,
): string | undefined {
  if (!protectionLevel) return undefined;

  switch (protectionLevel) {
    case ECRMLProtectionLevel.DispersedLanguageSupport:
      return 'Dispersed Language Support';
    case ECRMLProtectionLevel.RegionSpecificRights:
      return 'Region-Specific Rights';
    case ECRMLProtectionLevel.ComprehensiveProtection:
      return 'Comprehensive Protection';
    case ECRMLProtectionLevel.CulturalRecognition:
      return 'Cultural Recognition';
    default:
      return undefined;
  }
}

export function getEcrmlDescription(
  protectionLevel: ECRMLProtectionLevel | undefined,
): string | undefined {
  if (!protectionLevel) return undefined;

  switch (protectionLevel) {
    case ECRMLProtectionLevel.DispersedLanguageSupport:
      return 'Applied to languages without a specific geographic home. Protection measures are adapted to this circumstance.';
    case ECRMLProtectionLevel.RegionSpecificRights:
      return 'Protection levels vary. In some regions, the language has advanced rights (Part III); in others, it has general protection (Part II).';
    case ECRMLProtectionLevel.ComprehensiveProtection:
      return 'The state has committed to specific, legally binding actions in schools, courts, administration, and media (e.g., must provide primary education in this language).';
    case ECRMLProtectionLevel.CulturalRecognition:
      return 'The state commits to general principles: preventing discrimination, promoting the language in education, and respecting its geographic boundaries.';
    default:
      return undefined;
  }
}
