import { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamsContextState } from '@features/params/PageParamsContext';
import usePageParams from '@features/params/usePageParams';

import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';
import { EntityData, EntityType } from '@entities/types/EntityTypes';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import Field from '../fields/Field';

export function useFilterLabels(): Partial<Record<Field, string>> {
  const params = usePageParams();
  const { getEntity } = useDataContext();
  const filterLabels = useMemo(
    () => ({
      [Field.LanguageScope]: getLanguageScopesLabel(params),
      [Field.Modality]: getModalityFilterLabel(params),
      [Field.TerritoryScope]: getTerritoryScopesLabel(params),
      [Field.TerritoryList]: getTerritoryFilterLabel(params, getEntity),
      [Field.WritingSystem]: getWritingSystemFilterLabel(params, getEntity),
      [Field.LanguageList]: getLanguageFilterLabel(params, getEntity),
      [Field.LanguageFamily]: getLanguageFamilyFilterLabel(params, getEntity),
      [Field.SourceForLanguage]: getLanguageSourceFilterLabel(params),
      [Field.Population]: getPopulationFilterLabel(params),
      [Field.Organization]: getOrganizationFilterLabel(params, getEntity),
      [Field.ISOStatus]: getISOStatusFilterLabel(params),
      [Field.Name]: getNameFilterLabel(params),
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

function getTerritoryFilterLabel(
  { territoryFilter }: PageParamsContextState,
  getEntity: (id: string) => EntityData | undefined,
): string {
  if (!territoryFilter) return 'found in any territory';
  if (territoryFilter.includes('[')) return 'found in ' + territoryFilter.split('[')[0].trim();
  if (territoryFilter.match(/^[A-Za-z]{2}$/)) {
    const ent = getEntity(territoryFilter);
    if (ent) return `found in ${ent.nameDisplay}`;
    return `found in territory with code "${territoryFilter}"`;
  }
  if (territoryFilter.match(/^[0-9]{3}$/)) {
    const ent = getEntity(territoryFilter);
    if (ent) return `found in ${ent.nameDisplay}`;
    return `found in region with code "${territoryFilter}"`;
  }
  return `found in "${territoryFilter}*"`;
}

function getWritingSystemFilterLabel(
  { writingSystemFilter }: PageParamsContextState,
  getEntity: (id: string) => EntityData | undefined,
): string {
  if (!writingSystemFilter) return 'written in any script';
  if (writingSystemFilter.includes('['))
    return 'written in ' + writingSystemFilter.split('[')[0].trim();
  if (writingSystemFilter.match(/^[A-Z][a-z]{3}$/)) {
    const ent = getEntity(writingSystemFilter);
    if (ent) return `written in ${ent.nameDisplay}`;
    return `written in script with code "${writingSystemFilter}"`;
  }
  return `written in "${writingSystemFilter}*"`;
}

function getLanguageFilterLabel(
  { languageFilter }: PageParamsContextState,
  getEntity: (id: string) => EntityData | undefined,
): string {
  if (!languageFilter) return 'any languoid';
  if (languageFilter.includes('[')) return 'related to ' + languageFilter.split('[')[0].trim();
  if (languageFilter.match(/^[a-z]{3}$/)) {
    const ent = getEntity(languageFilter);
    if (ent) return `related to ${ent.nameDisplay}`;
    return `related to language with code "${languageFilter}"`;
  }
  return `related to language "${languageFilter}*"`;
}

function getLanguageFamilyFilterLabel(
  { languageFamilyFilter }: PageParamsContextState,
  getEntity: (id: string) => EntityData | undefined,
): string {
  if (!languageFamilyFilter) return 'any languoid';
  if (languageFamilyFilter.includes('['))
    return 'related to ' + languageFamilyFilter.split('[')[0].trim();
  if (languageFamilyFilter.match(/^[a-z]{3}$/)) {
    const ent = getEntity(languageFamilyFilter);
    if (ent) return `related to ${ent.nameDisplay}`;
    return `related to language family with code "${languageFamilyFilter}"`;
  }
  return `related to language family "${languageFamilyFilter}*"`;
}

function getLanguageSourceFilterLabel({ languageSource }: PageParamsContextState): string {
  if (!languageSource) return 'any language list';
  return `in ${languageSource}`;
}

function getPopulationFilterLabel({
  populationMin,
  populationMax,
}: PageParamsContextState): string {
  if (populationMin == null && populationMax == null) return 'any population';
  if (populationMin == null) return `with population ≤ "${populationMax}*"`;
  if (populationMax == null) return `with population ≥ "${populationMin}*"`;
  return `with population ≥ "${populationMin}" & ≤ "${populationMax}"`;
}

function getOrganizationFilterLabel(
  { orgFilter }: PageParamsContextState,
  getEntity: (id: string) => EntityData | undefined,
): string {
  if (!orgFilter) return 'any organization';
  const ent = getEntity(orgFilter);
  if (ent) return `supported by ${ent.nameDisplay}`;
  return `in ${orgFilter}`;
}

function getISOStatusFilterLabel({ isoStatus }: PageParamsContextState): string {
  if (!isoStatus) return 'any ISO status';
  const statuses = isoStatus.map((s) => getLanguageISOStatusLabel(s));
  return `${statuses.join(', ')}`;
}

function getNameFilterLabel({ searchString }: PageParamsContextState): string {
  if (!searchString) return 'any name';
  return `matching ${searchString}*`;
}

export function getFilterTitle(field: Field, entType?: EntityType): string {
  switch (field) {
    case Field.Modality:
      return 'Language Use';
    case Field.LanguageScope:
      return 'Language Level';
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
      if (entType === EntityType.WritingSystem) return 'Potential Population';
      return 'Population';
    case Field.Organization:
      return 'Organization';
    default:
      return 'Unknown Filter';
  }
}
