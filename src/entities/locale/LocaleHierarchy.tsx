import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData, ObjectData, WritingSystemData } from '@entities/types/DataTypes';
import { useDataContext } from '@features/data-loading/DataContext';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';
import { ObjectType } from '@widgets/PageParamTypes';
import React from 'react';

import { getScopeFilter } from '../../features/filtering/filter';
import { getSortFunction } from '../../features/sorting/sort';

export const LocaleHierarchy: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = getScopeFilter();

  const rootNodes = getLocaleTreeNodes(languagesInSelectedSource, sortFunction, filterByScope);

  return (
    <TreeListPageBody
      rootNodes={rootNodes}
      description={
        <>
          Locales are grouped by the language/writing system/territory that is represented by the
          locale code. Most locale codes do not specify a writing system so they are grouped with
          the primary writing system for the language.
        </>
      }
    />
  );
};

export function getLocaleTreeNodes(
  languages: LanguageData[],
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean = () => true,
): TreeNodeData[] {
  return languages
    .filter(filterFunction ?? (() => true))
    .filter((lang) => lang.locales.length > 0)
    .sort(sortFunction)
    .map((lang) => getLanguageTreeNode(lang, sortFunction, filterFunction));
}

function getLanguageTreeNode(
  lang: LanguageData,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean,
): TreeNodeData {
  return {
    type: ObjectType.Locale,
    object: lang,
    children: getWritingSystemNodesForLanguage(lang, sortFunction, filterFunction),
  };
}

// Note the filterFunction here is causing some problems. EG if you search for Latin then you see which languages support latin but not which
function getWritingSystemNodesForLanguage(
  lang: LanguageData,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean,
): TreeNodeData[] {
  const territoryNodesWithoutWritingSystems = lang.locales
    .filter((locale) => locale.scriptCode == null)
    .sort(sortFunction)
    .map((territory) => getLocaleNodeForTerritory(territory));
  const otherWritingSystemNodes = Object.values(lang.writingSystems)
    .filter((ws) => ws.ID != lang.primaryScriptCode)
    .sort(sortFunction)
    .map((writingSystem) =>
      getLocaleNodeForWritingSystem(writingSystem, lang.ID, sortFunction, filterFunction),
    );

  if (lang.primaryWritingSystem) {
    const defaultWritingSystemNode = getLocaleNodeForWritingSystem(
      lang.primaryWritingSystem,
      lang.ID,
      sortFunction,
      filterFunction,
    );
    defaultWritingSystemNode.children = [
      ...territoryNodesWithoutWritingSystems,
      ...defaultWritingSystemNode.children,
    ].sort((a, b) => sortFunction(a.object, b.object));

    // Put the default writing system first, then the rest
    return [defaultWritingSystemNode, ...otherWritingSystemNodes];
  }

  // Otherwise somehow we don't know what writing system the unspecified locales should use
  // So we put them at the same level, after the writing systems
  return [...otherWritingSystemNodes, ...territoryNodesWithoutWritingSystems];
}

function getLocaleNodeForWritingSystem(
  writingSystem: WritingSystemData,
  languageID: LanguageCode,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean,
): TreeNodeData {
  return {
    type: ObjectType.Locale,
    object: writingSystem,
    children: getTerritoryNodesForWritingSystem(
      writingSystem,
      languageID,
      sortFunction,
      filterFunction,
    ),
  };
}

function getTerritoryNodesForWritingSystem(
  writingSystem: WritingSystemData,
  languageID: LanguageCode,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean,
): TreeNodeData[] {
  if (!writingSystem.localesWhereExplicit) return [];
  return writingSystem.localesWhereExplicit
    .filter((locale) => locale.languageCode === languageID)
    .filter(filterFunction)
    .sort(sortFunction)
    .map((locale) => getLocaleNodeForTerritory(locale));
}

function getLocaleNodeForTerritory(locale: LocaleData): TreeNodeData {
  return {
    type: ObjectType.Locale,
    object: locale,
    children: [],
  };
}
