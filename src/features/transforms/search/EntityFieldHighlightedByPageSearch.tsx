import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/EntityTypes';

import Highlightable from '@shared/ui/Highlightable';

import getSearchableField from './getSearchableField';
import HighlightedEntityField from './HighlightedEntityField';

interface Props {
  ent: EntityData;
  field: SearchableField;
}

/**
 * Use this if you want to highlight something based on the page search.
 * Use HighlightedEntityField if you want to highlight on arbitrary queries unrelated to the current search.
 */
const EntityFieldHighlightedByPageSearch: React.FC<Props> = ({ ent, field }) => {
  const { searchBy: pageSearchBy, searchString } = usePageParams();

  if (isFieldHighlightedBySearch(pageSearchBy, field)) {
    return <HighlightedEntityField ent={ent} query={searchString} field={field} />;
  }
  // Otherwise don't highlight, just return the field value
  return getSearchableField(ent, field, searchString);
};

/** Same as EntityFieldHighlightedByPageSearch, for a value that is already a string (e.g. an API row). */
export const TextHighlightedByPageSearch: React.FC<{
  text: string;
  field: SearchableField;
  /** Highlighted instead when `text` is empty, like HighlightedEntityField falls back to the name. */
  fallback?: string;
}> = ({ text, field, fallback }) => {
  const { searchBy: pageSearchBy, searchString } = usePageParams();
  if (!isFieldHighlightedBySearch(pageSearchBy, field)) return text;
  return <Highlightable text={text || fallback || ''} searchPattern={searchString} />;
};

function isFieldHighlightedBySearch(
  pageSearchBy: SearchableField,
  field: SearchableField,
): boolean {
  if (pageSearchBy === field) return true;
  // If searching on all names, also highlight fields for English Name or Endonym
  if (pageSearchBy === SearchableField.NameAny) {
    return [
      SearchableField.NameCLDR,
      SearchableField.NameDisplay,
      SearchableField.NameEndonym,
      SearchableField.NameGlottolog,
      SearchableField.NameISO,
    ].includes(field);
  }
  // If searching on name or code, also highlight fields for English Name or Code
  return pageSearchBy === SearchableField.CodeOrNameAny;
}

export default EntityFieldHighlightedByPageSearch;
