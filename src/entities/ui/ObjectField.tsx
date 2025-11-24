import React from 'react';

import { ObjectType, SearchableField } from '@features/params/PageParamTypes';
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
    pageSearchBy === SearchableField.NameAny &&
    [
      SearchableField.NameCLDR,
      SearchableField.NameDisplay,
      SearchableField.NameEndonym,
      SearchableField.NameGlottolog,
      SearchableField.NameISO,
    ].includes(field)
  ) {
    // If searching on all names, also highlight fields for English Name or Endonym
    return <HighlightedObjectField object={object} query={searchString} field={field} />;
  } else if (
    pageSearchBy === SearchableField.NameOrCode &&
    [SearchableField.NameDisplay, SearchableField.Code].includes(field)
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
    case SearchableField.NameAny:
      return object.names.filter((name) => anyWordStartsWith(name, query ?? ''))[0] ?? '';
    case SearchableField.Code:
      return object.codeDisplay;
    case SearchableField.NameEndonym:
      return object.nameEndonym ?? '';
    case SearchableField.NameDisplay:
      return object.nameDisplay;
    case SearchableField.NameOrCode:
      return object.nameDisplay + ' [' + object.codeDisplay + ']';
    case SearchableField.NameISO:
      return object.type === ObjectType.Language ? (object.ISO?.name ?? '') : '';
    case SearchableField.NameCLDR:
      return object.type === ObjectType.Language ? (object.CLDR?.name ?? '') : '';
    case SearchableField.NameGlottolog:
      return object.type === ObjectType.Language ? (object.Glottolog?.name ?? '') : '';
    default:
      return '';
  }
}
