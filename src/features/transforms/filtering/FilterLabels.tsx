import usePageParams from '@features/params/usePageParams';

import { getModalityLabel } from '@entities/language/LanguageModalityDisplay';

export function getFilterLabels() {
  return {
    languageScope: getLanguageScopeLabel(),
    modalityFilter: getModalityFilterLabel(),
    territoryScope: getTerritoryScopeLabel(),
    territoryFilter: getTerritoryFilterLabel(),
    writingSystemFilter: getWritingSystemFilterLabel(),
    languageFilter: getLanguageFilterLabel(),
  };
}

function getModalityFilterLabel(): string {
  const { modalityFilter } = usePageParams();
  if (modalityFilter.length === 0) return 'any modality';
  return modalityFilter.map((m) => getModalityLabel(m) ?? 'modality').join(' or ');
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
  if (territoryFilter.match(/^[A-Za-z]{2}$/))
    return `found in territory with code "${territoryFilter}"`;
  if (territoryFilter.match(/^[0-9]{3}$/))
    return `found in territory with code "${territoryFilter}"`;
  return `found in "${territoryFilter}*"`;
}

function getWritingSystemFilterLabel(): string {
  const { writingSystemFilter } = usePageParams();
  if (!writingSystemFilter) return 'written in any script';
  if (writingSystemFilter.includes('['))
    return 'written in ' + writingSystemFilter.split('[')[0].trim();
  if (writingSystemFilter.match(/^[A-Z][a-z]{3}$/))
    return `written in script with code "${writingSystemFilter}"`;
  return `written in "${writingSystemFilter}*"`;
}

function getLanguageFilterLabel(): string {
  const { languageFilter } = usePageParams();
  if (!languageFilter) return 'any languoid';
  if (languageFilter.includes('[')) return 'related to ' + languageFilter.split('[')[0].trim();
  if (languageFilter.match(/[a-z]{3}/)) return `related to language with code "${languageFilter}"`;
  return `related to language "${languageFilter}*"`;
}
