import { CensusData } from './CensusTypes';

export function getCensusLanguageUse(census: CensusData) {
  const { languageUse, acquisitionOrder, domain } = census;
  const languageUseParts = [
    languageUse,
    acquisitionOrder !== 'Any' && acquisitionOrder,
    domain && `@${domain}`,
  ].filter(Boolean);
  return languageUseParts.length > 0 ? languageUseParts.join(', ') : undefined;
}
