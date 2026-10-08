import { useCallback } from 'react';

import { getEntityParents } from '@widgets/pathnav/getParentsAndDescendants';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { getWritingSystemsInEntity } from '@entities/lib/getEntityMiscFields';
import { getContainingTerritories } from '@entities/lib/getEntityRelatedTerritories';
import { EntityData, EntityType } from '@entities/types/EntityTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { uniqueBy } from '@shared/lib/setUtils';
import { anyWordStartsWith } from '@shared/lib/stringUtils';

import Field from '../fields/Field';
import { isFieldApplicable } from '../fields/FieldApplicability';
import { getOrganizationsForEntity } from '../fields/getEntityConnection';
import { sortByPopulation } from '../sorting/sort';
import TransformEnum from '../TransformEnum';

import { FilterFunctionType } from './filter';
import { parseFilterEntityID } from './FilterEntityID';
import useFilters from './useFilters';

/**
 * Returns a combined function that will filter entites by other entities they are connected to.
 */
export function getFilterByConnections({
  lang = true,
  territory = true,
  writing = true,
}: { lang?: boolean; territory?: boolean; writing?: boolean } = {}): FilterFunctionType {
  const filterBy = useFilters();

  const filterByTerritory = territory ? filterBy[Field.TerritoryList] : () => true;
  const filterByWritingSystem = writing ? filterBy[Field.WritingSystem] : () => true;
  const filterByLanguage = lang ? filterBy[Field.LanguageList] : () => true;
  const filterByLanguageFamily = lang ? filterBy[Field.LanguageFamily] : () => true;
  const filterByOrganization = filterBy[Field.Organization]
    ? filterBy[Field.Organization]
    : () => true;
  return useCallback(
    (ent: EntityData) =>
      filterByTerritory(ent) &&
      filterByWritingSystem(ent) &&
      filterByLanguage(ent) &&
      filterByLanguageFamily(ent) &&
      filterByOrganization(ent),
    [
      filterByTerritory,
      filterByWritingSystem,
      filterByLanguage,
      filterByLanguageFamily,
      filterByOrganization,
    ],
  );
}

/**
 * Provide a function that returns true for items that are relevant to a territory.
 */
export function buildFilterByTerritory(territoryFilter: string): FilterFunctionType {
  // Split up strings like "United States [US]" into "US" and "United States"
  const { name, code } = parseFilterEntityID(territoryFilter, EntityType.Territory);

  return (ent: EntityData) => {
    if (!territoryFilter) return true;
    if (!isFieldApplicable(Field.TerritoryList, TransformEnum.Filter, ent.type)) return true;
    const territories = getContainingTerritories(ent);
    if (code) return territories.some((t) => t.codeDisplay === code);
    if (!name) return true;
    return territories.some((t) => anyWordStartsWith(t.nameDisplay, name));
  };
}

export function buildFilterByWritingSystem(writingSystemFilter: string): FilterFunctionType {
  // Split up strings like "Traditional Han [Hant]" into "Hant" and "Traditional Han"
  const { name, code } = parseFilterEntityID(writingSystemFilter, EntityType.WritingSystem);

  return (ent: EntityData) => {
    if (!writingSystemFilter) return true;
    if (!isFieldApplicable(Field.WritingSystem, TransformEnum.Filter, ent.type)) return true;
    const scripts = getWritingSystemsRelevantToEntity(ent);
    if (code) return scripts.some((ws) => ws.codeDisplay === code);
    if (!name) return true;
    return scripts.some((ws) => anyWordStartsWith(ws.nameDisplay, name));
  };
}

// Similar to getEntityMiscFields's getWritingSystemsInEntity, but includes parents not children
export function getWritingSystemsRelevantToEntity(ent: EntityData): WritingSystemData[] {
  switch (ent.type) {
    case EntityType.Territory:
      return uniqueBy(
        ent.locales
          ?.filter((loc) => (loc.pop.writing.percent || 0) > 1)
          ?.map((loc) => loc.writingSystem ?? loc.language?.primaryWritingSystem)
          .filter((ws) => !!ws) ?? [],
        (ws) => ws.ID,
      );
    case EntityType.Locale:
      return [ent.writingSystem ?? ent.language?.primaryWritingSystem].filter((ws) => !!ws);
    case EntityType.WritingSystem:
      return [ent, ent.parentWritingSystem, ...(ent.childWritingSystems ?? [])].filter(
        (ws) => !!ws,
      );
    case EntityType.Language:
    case EntityType.Variant:
      // Same functionality
      return getWritingSystemsInEntity(ent) ?? [];
    case EntityType.Census:
      return []; // Not easy to get
    case EntityType.Keyboard:
      return uniqueBy(
        [ent.inputWritingSystem, ent.outputWritingSystem].filter((ws) => !!ws),
        (ws) => ws.ID,
      );
    case EntityType.Orthography:
      return [ent.writingSystem].filter((ws) => !!ws);
    case EntityType.Org:
    case EntityType.Technology:
      return []; // Not well defined
  }
}

export function buildFilterByLanguage(languageFilter: string): FilterFunctionType {
  // Split up strings like "German [deu]" into "deu" and "German"
  const { code, name } = parseFilterEntityID(languageFilter, EntityType.Language);

  return (ent: EntityData) => {
    if (!languageFilter) return true;
    if (!isFieldApplicable(Field.LanguageList, TransformEnum.Filter, ent.type)) return true;
    const langs = getLanguagesRelevantToEntity(ent);
    if (code) return langs.some((lang) => lang.codeDisplay === code);
    if (!name) return true;
    return langs.some((lang) => anyWordStartsWith(lang.nameDisplay, name));
  };
}

export function buildFilterByLanguageFamily(languageFamilyFilter: string): FilterFunctionType {
  // Split up strings like "Germanic [gem]" into "gem" and "Germanic"
  const { code, name } = parseFilterEntityID(languageFamilyFilter, EntityType.Language);

  return (ent: EntityData) => {
    if (!languageFamilyFilter) return true;
    if (!isFieldApplicable(Field.LanguageFamily, TransformEnum.Filter, ent.type)) return true;
    const langs = getLanguageFamiliesRelevantToEntity(ent);
    if (ent.ID === 'cmn') {
      console.trace();
      console.log(
        languageFamilyFilter,
        code,
        name,
        langs.map((e) => e.ID),
      );
    }
    if (code) return langs.some((lang) => lang.codeDisplay === code);
    if (!name) return true;
    return langs.some((lang) => anyWordStartsWith(lang.nameDisplay, name));
  };
}

export function getLanguagesRelevantToEntity(ent: EntityData): LanguageData[] {
  switch (ent.type) {
    case EntityType.Territory:
      return uniqueBy(
        ent.locales
          ?.filter((loc) => (loc.pop.speaking.percent || 0) > 1)
          ?.map((loc) => loc.language)
          .filter((lang) => !!lang) ?? [],
        (lang) => lang.ID,
      );
    case EntityType.Locale:
      return [ent.language].filter((lang) => !!lang);
    case EntityType.Census:
      return []; // Not easy to get
    case EntityType.Language:
      // gets the language family
      return [...(getEntityParents(ent) as LanguageData[]), ent].filter((lang) => !!lang);
    case EntityType.WritingSystem:
      return Object.values(ent.languages ?? {});
    case EntityType.Orthography:
      return [ent.language].filter((lang) => !!lang);
    case EntityType.Variant:
      return uniqueBy(
        [ent.equivalentLanguage, ...(ent.languages ?? [])].filter((lang) => !!lang),
        (lang) => lang.ID,
      );
    case EntityType.Keyboard:
      return ent.languages ?? [];
    case EntityType.Technology:
      if (ent.languageSupport)
        return uniqueBy(
          ent.languageSupport?.map((support) => support.lang).filter((lang) => !!lang) ?? [],
          (lang) => lang.ID,
        );
      if (ent.keyboards)
        return uniqueBy(
          ent.keyboards.flatMap((kb) => kb.languages ?? []),
          (lang) => lang.ID,
        );
      return [];
    case EntityType.Org:
      return []; // Too computationally intensive to get
  }
}

export function getLanguageFamiliesRelevantToEntity(ent: EntityData): LanguageData[] {
  switch (ent.type) {
    case EntityType.Territory:
      return uniqueBy(
        ent.locales
          ?.filter(
            (loc) =>
              (loc.pop.speaking.percent || 0) > 1 && loc.language?.scope === LanguageScope.Family,
          )
          .sort(sortByPopulation)
          ?.map((loc) => loc.language)
          .filter((lang) => !!lang) ?? [],
        (lang) => lang.ID,
      );
    case EntityType.Locale:
      return ent.language ? getLanguageFamiliesRelevantToEntity(ent.language) : [];
    case EntityType.Language:
      // gets the language family
      return [...(getEntityParents(ent) as LanguageData[]), ent].filter((lang) => !!lang);
    case EntityType.WritingSystem:
      return Object.values(ent.languages ?? {});
    case EntityType.Orthography:
      return ent.language ? getLanguageFamiliesRelevantToEntity(ent.language) : [];
    case EntityType.Census:
    case EntityType.Variant:
    case EntityType.Keyboard:
    case EntityType.Org:
    case EntityType.Technology:
      return []; // Too computationally intensive to get
  }
}

export function buildFilterByOrganization(
  orgFilter: string /* Organization ID */,
): FilterFunctionType {
  if (!orgFilter) return () => true;

  const { code, name } = parseFilterEntityID(orgFilter);

  return (ent: EntityData): boolean => {
    if (!isFieldApplicable(Field.Organization, TransformEnum.Filter, ent.type)) return true;
    const orgs = getOrganizationsForEntity(ent);
    if (!orgs) return false;
    if (code) return orgs.some((org) => org.ID === code || org.codeDisplay === code);
    if (!name) return true;
    return orgs.some((org) => anyWordStartsWith(org.nameDisplay, name)) ?? false;
  };
}
