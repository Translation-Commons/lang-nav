import { useMemo } from 'react';

import { PageParamsContextState } from '@features/params/PageParamsContext';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import Field from '../fields/Field';

export function useFilterLabels() {
  const params = usePageParams();
  const filterLabels = useMemo(
    () => ({
      languageScope: getLanguageScopesLabel(params),
      modalityFilter: getModalityFilterLabel(params),
      territoryScope: getTerritoryScopesLabel(params),
      territoryFilter: getTerritoryFilterLabel(params),
      writingSystemFilter: getWritingSystemFilterLabel(params),
      languageFilter: getLanguageFilterLabel(params),
      languageFamilyFilter: getLanguageFamilyFilterLabel(params),
    }),
    [params],
  );
  return filterLabels;
}

function getModalityFilterLabel({ modalityFilter }: PageParamsContextState): string {
  if (modalityFilter.length === 0) return 'any modality';
  return modalityFilter.map((m) => getModalityLabel(m) ?? 'modality').join(' or ');
}

function getLanguageScopesLabel({ languageScopes }: PageParamsContextState): string {
  if (languageScopes.length === 0) return 'any languoid';
  return languageScopes.map(getLanguageScopeLabel).join(' or ').toLowerCase();
}

function getTerritoryScopesLabel({ territoryScopes }: PageParamsContextState): string {
  if (territoryScopes.length === 0) return 'any territory';
  return territoryScopes.map(getTerritoryScopeLabel).join(' or ').toLowerCase();
}

function getTerritoryFilterLabel({ territoryFilter }: PageParamsContextState): string {
  if (!territoryFilter) return 'found in any territory';
  if (territoryFilter.includes('[')) return 'found in ' + territoryFilter.split('[')[0].trim();
  if (territoryFilter.match(/^[A-Za-z]{2}$/))
    return `found in territory with code "${territoryFilter}"`;
  if (territoryFilter.match(/^[0-9]{3}$/))
    return `found in territory with code "${territoryFilter}"`;
  return `found in "${territoryFilter}*"`;
}

function getWritingSystemFilterLabel({ writingSystemFilter }: PageParamsContextState): string {
  if (!writingSystemFilter) return 'written in any script';
  if (writingSystemFilter.includes('['))
    return 'written in ' + writingSystemFilter.split('[')[0].trim();
  if (writingSystemFilter.match(/^[A-Z][a-z]{3}$/))
    return `written in script with code "${writingSystemFilter}"`;
  return `written in "${writingSystemFilter}*"`;
}

function getLanguageFilterLabel({ languageFilter }: PageParamsContextState): string {
  if (!languageFilter) return 'any languoid';
  if (languageFilter.includes('[')) return 'related to ' + languageFilter.split('[')[0].trim();
  if (languageFilter.match(/^[a-z]{3}$/))
    return `related to language with code "${languageFilter}"`;
  return `related to language "${languageFilter}*"`;
}

function getLanguageFamilyFilterLabel({ languageFamilyFilter }: PageParamsContextState): string {
  if (!languageFamilyFilter) return 'any languoid';
  if (languageFamilyFilter.includes('['))
    return 'related to ' + languageFamilyFilter.split('[')[0].trim();
  if (languageFamilyFilter.match(/^[a-z]{3}$/))
    return `related to language family with code "${languageFamilyFilter}"`;
  return `related to language family "${languageFamilyFilter}*"`;
}

export function getFilterTitle(field: Field, entType?: EntityType): string {
  switch (field) {
    case Field.Modality:
      return 'Language Use';
    case Field.LanguageScope:
      return 'Language Type';
    case Field.TerritoryScope:
      return 'Territory Type';
    case Field.TerritoryList:
      if (entType === EntityType.WritingSystem) return 'Originated in...';
      return 'Found in...';
    case Field.WritingSystem:
      if (entType === EntityType.WritingSystem) return 'Originated in...';
      return 'Written in...';
    case Field.LanguageList:
      if (entType === EntityType.WritingSystem) return 'Is written for...';
      return 'Language';
    case Field.LanguageFamily:
      return 'Language Family';
    case Field.SourceForLanguage:
      return 'Language List / Language Standard';
    case Field.ISOStatus:
      return 'ISO Status';
    case Field.Population:
      return 'Population';
    case Field.Organization:
      return 'Organization';
    default:
      return 'Unknown Filter';
  }
}
