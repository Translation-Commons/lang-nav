import usePageParams from '@features/params/usePageParams';

export function getFilterLabels() {
  return {
    languageScope: getLanguageScopeLabel(),
    territoryScope: getTerritoryScopeLabel(),
    territoryFilter: getTerritoryFilterLabel(),
    writingSystemFilter: getWritingSystemFilterLabel(),
    languageFilter: getLanguageFilterLabel(),
  };
}

function getLanguageScopeLabel(): string {
  const { languageScopes } = usePageParams();
  if (languageScopes.length === 0) return 'any languoid';
  return languageScopes
    .map((scope) => scope.toString())
    .join(' or ')
    .toLowerCase();
}

function getTerritoryScopeLabel(): string {
  const { territoryScopes } = usePageParams();
  if (territoryScopes.length === 0) return 'any territory';
  return territoryScopes
    .map((scope) => scope.toString())
    .join(' or ')
    .toLowerCase();
}

function getTerritoryFilterLabel(): string {
  const { territoryFilter } = usePageParams();
  if (!territoryFilter) return 'found in any territory';
  if (territoryFilter.includes('[')) return 'found in ' + territoryFilter.split('[')[0].trim();
  return `found in "${territoryFilter}*"`;
}

function getWritingSystemFilterLabel(): string {
  const { writingSystemFilter } = usePageParams();
  if (!writingSystemFilter) return 'written in any script';
  if (writingSystemFilter.includes('['))
    return 'written in ' + writingSystemFilter.split('[')[0].trim();
  return `written in "${writingSystemFilter}*"`;
}

function getLanguageFilterLabel(): string {
  const { languageFilter } = usePageParams();
  if (!languageFilter) return 'any languoid';
  if (languageFilter.includes('[')) return 'related to ' + languageFilter.split('[')[0].trim();
  return `related to language "${languageFilter}*"`;
}
