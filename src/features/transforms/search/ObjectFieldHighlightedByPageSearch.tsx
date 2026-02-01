import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import getSearchableField from './getSearchableField';
import HighlightedObjectField from './HighlightedObjectField';

interface Props {
  object: ObjectData;
  field: SearchableField;
}

/**
 * Use this if you want to highlight something based on the page search.
 * Use HighlightedObjectField if you want to highlight on arbitrary queries unrelated to the current search.
 */
const ObjectFieldHighlightedByPageSearch: React.FC<Props> = ({ object, field }) => {
  const { searchBy: pageSearchBy, searchString } = usePageParams();

  if (pageSearchBy === field) {
    return <HighlightedObjectField object={object} query={searchString} field={field} />;
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
    return <HighlightedObjectField object={object} query={searchString} field={field} />;
  } else if (pageSearchBy === SearchableField.CodeOrNameAny) {
    // If searching on name or code, also highlight fields for English Name or Code
    return <HighlightedObjectField object={object} query={searchString} field={field} />;
  }
  // Otherwise don't highlight, just return the field value
  return getSearchableField(object, field, searchString);
};

export default ObjectFieldHighlightedByPageSearch;
