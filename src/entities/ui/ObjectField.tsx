import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import { anyWordStartsWith } from '@shared/lib/stringUtils';
import Highlightable from '@shared/ui/Highlightable';

interface Props {
  object: ObjectData;
  field: SearchableField;
}

/**
 * Use this if you want to highlight something based on the page search.
 * Use HighlightedObjectField if you want to highlight on arbitrary queries unrelated to the current search.
 */
export const ObjectFieldHighlightedByPageSearch: React.FC<Props> = ({ object, field }) => {
  const { searchBy: pageSearchBy, searchString } = usePageParams();

  if (pageSearchBy === field) {
    return <HighlightedObjectField object={object} query={searchString} field={field} />;
  } else if (
    pageSearchBy === SearchableField.AllNames &&
    [SearchableField.EngName, SearchableField.Endonym].includes(field)
  ) {
    // If searching on all names, also highlight fields for English Name or Endonym
    return <HighlightedObjectField object={object} query={searchString} field={field} />;
  } else if (
    pageSearchBy === SearchableField.NameOrCode &&
    [SearchableField.EngName, SearchableField.Code].includes(field)
  ) {
    // If searching on name or code, also highlight fields for English Name or Code
    return <HighlightedObjectField object={object} query={searchString} field={field} />;
  }
  // Otherwise don't highlight, just return the field value
  return getSearchableField(object, field, searchString);
};

interface HighlightedObjectFieldProps {
  object: ObjectData;
  field: SearchableField;
  query: string;
}

export const HighlightedObjectField: React.FC<HighlightedObjectFieldProps> = ({
  object,
  field,
  query,
}) => {
  return <Highlightable text={getSearchableField(object, field, query)} searchPattern={query} />;
};

export function getSearchableField(object: ObjectData, field: SearchableField, query?: string) {
  switch (field) {
    case SearchableField.AllNames:
      return object.names.filter((name) => anyWordStartsWith(name, query ?? ''))[0] ?? '';
    case SearchableField.Code:
      return object.codeDisplay;
    case SearchableField.Endonym:
      return object.nameEndonym ?? '';
    case SearchableField.EngName:
      return object.nameDisplay;
    case SearchableField.NameOrCode:
      return object.nameDisplay + ' [' + object.codeDisplay + ']';
  }
}
