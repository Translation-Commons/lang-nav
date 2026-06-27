import React from 'react';

import { getLanguageTreeNodes } from '@widgets/treelists/LanguageHierarchy';
import { getLocaleTreeNodes } from '@widgets/treelists/LocaleHierarchy';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import useFilters from '@features/transforms/filtering/useFilters';
import { getSortFunction } from '@features/transforms/sorting/sort';
import { TreeNodeData } from '@features/treelist/TreeListNode';
import TreeListRoot from '@features/treelist/TreeListRoot';

import { LanguageData } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

const LanguageConnections: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { languageSource } = usePageParams();
  const { getCLDRLanguage } = useDataContext();
  const sortFunction = getSortFunction();
  const filterByScope = useFilters()[Field.TerritoryScope];
  const { childLanguages, ISO, Glottolog, variants, equivalentVariant } = lang;
  const relatedLanguages = (lang.CLDR.languageMatch ?? [])
    .map((match) => ({
      match,
      relatedLanguage: getCLDRLanguage(match.supported),
    }))
    .filter(
      (entry): entry is { match: (typeof entry)['match']; relatedLanguage: LanguageData } =>
        entry.relatedLanguage != null,
    );

  return (
    <DetailsSection title="Connections">
      {ISO.parentLanguage && (
        <DetailsField title="ISO group">
          <HoverableObjectName object={ISO.parentLanguage} />
        </DetailsField>
      )}
      {Glottolog.parentLanguage && (
        <DetailsField title="Glottolog group">
          <HoverableObjectName object={Glottolog.parentLanguage} />
        </DetailsField>
      )}
      {equivalentVariant && (
        <DetailsField title="Equivalent Variant">
          <HoverableObjectName object={equivalentVariant} labelSource="name and code" />
        </DetailsField>
      )}
      {variants && variants.length > 0 && (
        <DetailsField title="Variants">
          <CommaSeparated>
            {variants.map((v) => (
              <HoverableObjectName key={v.ID} object={v} labelSource="name and code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      {relatedLanguages.length > 0 && (
        <DetailsField title="Related Languages (CLDR)">
          <CommaSeparated>
            {relatedLanguages.map(({ match, relatedLanguage }) => (
              <span key={match.desired + ':' + match.supported + ':' + match.distance}>
                <HoverableObjectName object={relatedLanguage} /> ({match.distance} CLDR)
              </span>
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      <DetailsField title="Constituents">
        <TreeOrList
          treeNodes={
            childLanguages.length > 0
              ? getLanguageTreeNodes([lang], languageSource, sortFunction)
              : []
          }
          listNodes={childLanguages.sort(sortFunction).map((l) => (
            <HoverableObjectName key={l.ID} object={l} />
          ))}
          emptyMessage="No languages come from this language."
        />
      </DetailsField>
      <DetailsField title="Locales">
        <TreeOrList
          treeNodes={
            lang.locales.length > 0 ? getLocaleTreeNodes([lang], sortFunction, filterByScope) : []
          }
          listNodes={(lang.locales ?? [])
            .filter(filterByScope)
            .sort(sortFunction)
            .map((v) => (
              <HoverableObjectName key={v.ID} object={v} />
            ))}
          emptyMessage="No locales available for this language."
        />
      </DetailsField>
      {lang.keyboards && lang.keyboards.length > 0 && (
        <DetailsField title="Keyboards">
          {lang.keyboards && lang.keyboards.length > 0 && (
            <CommaSeparated>
              {lang.keyboards.map((keyboard) => (
                <HoverableObjectName key={keyboard.ID} object={keyboard} />
              ))}
            </CommaSeparated>
          )}
        </DetailsField>
      )}
    </DetailsSection>
  );
};

type TreeOrListProps = {
  treeNodes: TreeNodeData[];
  listNodes: React.ReactNode[];
  emptyMessage: string;
};
const TreeOrList: React.FC<TreeOrListProps> = ({ treeNodes, listNodes, emptyMessage }) => {
  const [viewAsTree, setViewAsTree] = React.useState(false);

  if ((treeNodes.length ?? 0) === 0 && (listNodes.length ?? 0) === 0) {
    return <Deemphasized>{emptyMessage}</Deemphasized>;
  }

  return (
    <>
      <HoverableButton
        onClick={() => setViewAsTree((prev) => !prev)}
        style={{ padding: '0.25em' }}
        hoverContent={viewAsTree ? 'Click to view as list' : 'Click to view as tree'}
      >
        {viewAsTree ? 'as tree' : 'as list'}
      </HoverableButton>{' '}
      {viewAsTree ? (
        <TreeListRoot rootNodes={treeNodes} />
      ) : (
        <CommaSeparated>{listNodes}</CommaSeparated>
      )}
    </>
  );
};

export default LanguageConnections;
