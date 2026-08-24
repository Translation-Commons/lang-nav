import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import { useScopeFilter } from '@features/transforms/filtering/filter';
import LanguageSourceSelector from '@features/transforms/filtering/selectors/LanguageSourceSelector';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { LanguageData, LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import { EntityData } from '@entities/types/DataTypes';

export const LanguageHierarchy: React.FC = () => {
  const { languageSource } = usePageParams();
  const { languagesInSelectedSource } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = useScopeFilter();

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
          <div className="inline-block align-top px-1 h-6">
            <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
              <LanguageSourceSelector />
            </SelectorDisplayProvider>
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
  sortFunction: (a: EntityData, b: EntityData) => number,
  filterFunction: (a: EntityData) => boolean = () => true,
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
  sortFunction: (a: EntityData, b: EntityData) => number,
  filterFunction: (a: EntityData) => boolean,
  depth: number,
): TreeNodeData {
  return {
    type: EntityType.Language,
    ent: lang,
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
