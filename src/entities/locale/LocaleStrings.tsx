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

export interface ECRMLInfo {
  title: string;
  description: string;
}

export function getECRMLInfo(protectionLevel: string | undefined): ECRMLInfo | undefined {
  if (!protectionLevel) return undefined;

  if (protectionLevel.includes('Part II (Article 7.5)')) {
    return {
      title: 'Dispersed Language Support',
      description:
        'Applied to languages without a specific geographic home. Protection measures are adapted to this circumstance.',
    };
  }

  if (
    protectionLevel.includes(
      'Part II (Article 7) or Part II (Article 7) and Part III (Articles 8-14)',
    )
  ) {
    return {
      title: 'Region-Specific Rights',
      description:
        'Protection levels vary. In some regions, the language has advanced rights (Part III); in others, it has general protection (Part II).',
    };
  }

  if (protectionLevel.includes('Part II (Article 7) and Part III (Articles 8-14)')) {
    return {
      title: 'Comprehensive Protection',
      description:
        'The state has committed to specific, legally binding actions in schools, courts, administration, and media (e.g., must provide primary education in this language).',
    };
  }

  if (protectionLevel.includes('Part II (Article 7)')) {
    return {
      title: 'Cultural Recognition',
      description:
        'The state commits to general principles: preventing discrimination, promoting the language in education, and respecting its geographic boundaries.',
    };
  }

  return undefined;
}
