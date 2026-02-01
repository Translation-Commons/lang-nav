import React from 'react';

import LanguageSourceSelector from '@widgets/controls/selectors/LanguageSourceSelector';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import { getScopeFilter } from '@features/transforms/filtering/filter';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { LanguageData, LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
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
          different sources disagree on what is a language/dialect/etc. The parent/child
          relationships come from the selected language source (
          <div
            style={{
              display: 'inline-block',
              height: '1em',
              verticalAlign: 'top',
              padding: '0.25em 0',
            }}
          >
            <LanguageSourceSelector display={SelectorDisplay.InlineDropdown} />
          </div>
          ). <SourceWarning languageSource={languageSource} />
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
  depth: number = 0,
): TreeNodeData[] {
  if (depth > 30) {
    console.warn(
      'getLanguageTreeNodes exceeded max depth of 30, possible circular reference for language',
      languages[0],
    );
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
      lang[languageSource].childLanguages ?? [],
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

const SourceWarning: React.FC<{ languageSource: LanguageSource }> = ({ languageSource }) => {
  switch (languageSource) {
    case LanguageSource.Combined:
      return (
        <>Data comes from combining Glottolog and ISO sources, there may be some discrepancies.</>
      );
    case LanguageSource.CLDR:
      return (
        <>
          CLDR does not contain language family details so we cannot show a language hierarchy.
          However constituent languages are organized under their macrolanguages.
        </>
      );
    case LanguageSource.Ethnologue:
      return <>We have not extracted language family data from Ethnologue yet.</>;
    case LanguageSource.UNESCO:
      return (
        <>
          This display is not that useful because {languageSource} does have published language
          family data, you may want to try a different language source.
        </>
      );
    case LanguageSource.Glottolog:
    case LanguageSource.ISO:
    case LanguageSource.BCP:
      return null; // These all have comprehensive parent/child data, continue
  }
};
