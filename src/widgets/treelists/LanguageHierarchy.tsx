import React from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { getScopeFilter } from '@features/filtering/filter';
import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import { getSortFunction } from '@features/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { LanguageData, LanguageSource, LanguageScope } from '@entities/language/LanguageTypes';
import { ObjectData } from '@entities/types/DataTypes';

export const LanguageHierarchy: React.FC = () => {
  const { languageSource } = usePageParams();
  const { languagesInSelectedSource } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = getScopeFilter();

  const rootNodes = getLanguageTreeNodes(
    languagesInSelectedSource.filter(
      (lang) => lang.parentLanguage == null || !filterByScope(lang.parentLanguage),
    ),
    languageSource,
    sortFunction,
    filterByScope,
    0,
  );

  return (
    <TreeListPageBody
      rootNodes={rootNodes}
      description={
        <>
          Showing <strong>languages</strong>, language families, and <em>dialects</em>. Note that
          different people disagree on what it is a language/dialect/etc.
        </>
      }
    />
  );
};

export function getLanguageTreeNodes(
  languages: LanguageData[],
  languageSource: LanguageSource,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean = () => true,
  depth: number,
): TreeNodeData[] {
  if (depth > 30) {
    console.warn('getLanguageTreeNodes exceeded max depth of 30, possible circular reference');
    return [];
  }
  return languages
    .filter(filterFunction)
    .sort(sortFunction)
    .map((lang) => getLanguageTreeNode(lang, languageSource, sortFunction, filterFunction, depth))
    .filter((node) => node != null);
}

function getLanguageTreeNode(
  lang: LanguageData,
  languageSource: LanguageSource,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean,
  depth: number,
): TreeNodeData {
  return {
    type: ObjectType.Language,
    object: lang,
    children: getLanguageTreeNodes(
      lang.sourceSpecific[languageSource].childLanguages,
      languageSource,
      sortFunction,
      filterFunction,
      depth + 1,
    ),
    labelStyle: {
      fontWeight:
        lang.scope === LanguageScope.Language || lang.scope === LanguageScope.Macrolanguage
          ? 'bold'
          : 'normal',
      fontStyle: lang.scope === LanguageScope.Dialect ? 'italic' : 'normal',
    },
  };
}
