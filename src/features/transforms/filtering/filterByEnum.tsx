import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { ObjectData } from '@entities/types/DataTypes';

import { getLanguageForEntity, getTerritoryForEntity } from '../fields/getEntityConnection';

import { FilterFunctionType } from './filter';

export function buildFilterByLanguageScope(languageScopes: LanguageScope[]): FilterFunctionType {
  if (languageScopes.length === 0) return () => true;

  return (object: ObjectData): boolean => {
    const language = getLanguageForEntity(object);
    return !language || languageScopes.includes(language?.scope ?? LanguageScope.SpecialCode);
  };
}

export function buildFilterByModality(modalityFilter: LanguageModality[]): FilterFunctionType {
  if (modalityFilter.length === 0) return () => true;

  return (object: ObjectData): boolean => {
    const language = getLanguageForEntity(object);
    return !language || (language.modality != null && modalityFilter.includes(language.modality));
  };
}

export function buildFilterByTerritoryScope(territoryScopes: TerritoryScope[]): FilterFunctionType {
  if (territoryScopes.length === 0) return () => true;

  return (object: ObjectData): boolean => {
    const territory = getTerritoryForEntity(object);
    if (!territory) return true;
    return territoryScopes.includes(territory.scope);
  };
}

export function buildFilterByISOStatus(isoStatuses: LanguageISOStatus[]): FilterFunctionType {
  if (isoStatuses.length === 0) return () => true;

  return (object: ObjectData): boolean => {
    const language = getLanguageForEntity(object);
    if (!language) return true;
    return language.vitality?.iso != null && isoStatuses.includes(language.vitality.iso);
  };
}

export function buildFilterByVitalityEthnologueFine(
  ethnologueFineStatuses: VitalityEthnologueFine[],
): FilterFunctionType {
  if (ethnologueFineStatuses.length === 0) return () => true;

  return (object: ObjectData): boolean => {
    const language = getLanguageForEntity(object);
    if (!language) return true;
    return (
      language.vitality?.ethFine != null &&
      ethnologueFineStatuses.includes(language.vitality.ethFine)
    );
  };
}

export function buildFilterByVitalityEthnologueCoarse(
  ethnologueCoarseStatuses: VitalityEthnologueCoarse[],
): FilterFunctionType {
  if (ethnologueCoarseStatuses.length === 0) return () => true;

  return (object: ObjectData): boolean => {
    const language = getLanguageForEntity(object);
    if (!language) return true;
    return (
      language.vitality?.ethCoarse != null &&
      ethnologueCoarseStatuses.includes(language.vitality.ethCoarse)
    );
  };
}

export function buildFilterByLanguageSource(languageSource: LanguageSource): FilterFunctionType {
  if (!languageSource || languageSource === LanguageSource.Combined) return () => true;

  return (object: ObjectData): boolean => {
    const language = getLanguageForEntity(object);
    if (!language) return true;
    const sources = getLanguageSourcesForEntity(object);
    return sources.includes(languageSource);
  };
}

export function getLanguageSourcesForEntity(ent: ObjectData): LanguageSource[] {
  const language = getLanguageForEntity(ent);
  if (!language) return [];
  const sources: LanguageSource[] = [];
  if (language.ISO.code != null && language.ISO.retirementReason == null) {
    sources.push(LanguageSource.ISO);
    sources.push(LanguageSource.BCP);
  }
  if (language.Glottolog.code != null) sources.push(LanguageSource.Glottolog);
  if (language.CLDR.code != null && language.CLDR.dataProvider == null)
    sources.push(LanguageSource.CLDR);
  return sources;
}
