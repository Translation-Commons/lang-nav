import React from 'react';

import { getScopeFilter } from '../../controls/filter';
import { usePageParams } from '../../controls/PageParamsContext';
import { getSortFunction } from '../../controls/sort';
import { useDataContext } from '../../data/DataContext';
import { ObjectData } from '../../types/DataTypes';
import { LanguageData, LanguageSchema, LanguageScope } from '../../types/LanguageTypes';
import { ObjectType } from '../../types/PageParamTypes';
import { TreeNodeData } from '../common/TreeList/TreeListNode';
import TreeListPageBody from '../common/TreeList/TreeListPageBody';

export const LanguageHierarchy: React.FC = () => {
  const { languageSchema } = usePageParams();
  const { languages } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = getScopeFilter();

  const rootNodes = getLanguageTreeNodes(
    Object.values(languages).filter(
      (lang) => lang.parentLanguage == null || !filterByScope(lang.parentLanguage),
    ),
    languageSchema,
    sortFunction,
    filterByScope,
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
  languageSchema: LanguageSchema,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean = () => true,
): TreeNodeData[] {
  return languages
    .filter(filterFunction)
    .sort(sortFunction)
    .map((lang) => getLanguageTreeNode(lang, languageSchema, sortFunction, filterFunction))
    .filter((node) => node != null);
}

function getLanguageTreeNode(
  lang: LanguageData,
  languageSchema: LanguageSchema,
  sortFunction: (a: ObjectData, b: ObjectData) => number,
  filterFunction: (a: ObjectData) => boolean,
): TreeNodeData {
  return {
    type: ObjectType.Language,
    object: lang,
    children: getLanguageTreeNodes(
      lang.schemaSpecific[languageSchema].childLanguages,
      languageSchema,
      sortFunction,
      filterFunction,
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
