import React, { useCallback, useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import useFilters from '@features/transforms/filtering/useFilters';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListPageBody from '@features/treelist/TreeListPageBody';

import { LanguageData, LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import { EntityData } from '@entities/types/DataTypes';

import EnumDropdown from '@shared/ui/EnumDropdown';

export const LanguageHierarchy: React.FC = () => {
  const { languageSource, updatePageParams } = usePageParams();
  const { languagesInSelectedSource } = useDataContext();
  const sortFunction = getSortFunction();
  const filters = useFilters();
  const filterFunction = useCallback(
    (lang: EntityData) =>
      filters[Field.LanguageScope](lang) &&
      filters[Field.TerritoryList](lang) &&
      filters[Field.WritingSystem](lang) &&
      filters[Field.Modality](lang) &&
      filters[Field.ISOStatus](lang),
    [filters],
  );

  const rootNodes = useMemo(
    () =>
      getLanguageTreeNodes(
        languagesInSelectedSource.filter((lang) => lang[languageSource].parentLanguage == null),
        languageSource,
        sortFunction,
        filterFunction,
        0,
      ),
    [languagesInSelectedSource, languageSource, sortFunction, filterFunction],
  );

  return (
    <TreeListPageBody
      rootNodes={rootNodes}
      description={
        <>
          Showing <strong>languages</strong>, language families, and <em>dialects</em>. Note that
          different sources disagree on what is a language/dialect/etc. The parent/child
          relationships come from the selected language source (
          <EnumDropdown<LanguageSource>
            value={languageSource}
            onChange={(newValue) => updatePageParams({ languageSource: newValue })}
            options={Object.values(LanguageSource).filter((s) => s !== 'UNESCO')}
          />
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
    .flatMap((lang) => {
      // If it passes the filter, keep the node and keep on recursively processing its children
      if (filterFunction(lang))
        return getLanguageTreeNode(lang, languageSource, sortFunction, filterFunction, depth);

      // If it doesn't pass, and its the bookkeeping node, don't flatten the child languages because they are deprecated.
      if (lang.ID === 'book1242') return [];

      // If it doesn't pass, then evaluate this language's child languages instead
      return getLanguageTreeNodes(
        lang.childLanguages ?? [],
        languageSource,
        sortFunction,
        filterFunction,
        depth + 1,
      );
    })
    .sort((a, b) => sortFunction(a.ent, b.ent));
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
