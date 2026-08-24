import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

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

  if (pageSearchBy === field) {
    return <HighlightedEntityField ent={ent} query={searchString} field={field} />;
  } else if (
    pageSearchBy === SearchableField.NameAny &&
    [
      SearchableField.NameCLDR,
      SearchableField.NameDisplay,
      SearchableField.NameEndonym,
      SearchableField.NameGlottolog,
      SearchableField.NameISO,
      SearchableField.NameEthnologue,
    ].includes(field)
  ) {
    // If searching on all names, also highlight fields for English Name or Endonym
    return <HighlightedEntityField ent={ent} query={searchString} field={field} />;
  } else if (pageSearchBy === SearchableField.CodeOrNameAny) {
    // If searching on name or code, also highlight fields for English Name or Code
    return <HighlightedEntityField ent={ent} query={searchString} field={field} />;
  }
  // Otherwise don't highlight, just return the field value
  return getSearchableField(ent, field, searchString);
};

export default EntityFieldHighlightedByPageSearch;
