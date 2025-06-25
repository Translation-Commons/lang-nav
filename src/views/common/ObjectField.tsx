import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import Highlightable from '../../generic/Highlightable';
import { anyWordStartsWith } from '../../generic/stringUtils';
import { ObjectData } from '../../types/DataTypes';
import { LanguageSchema } from '../../types/LanguageTypes';
import { ObjectType, SearchableField } from '../../types/PageParamTypes';

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
  const lowercaseSearchString = searchString.toLowerCase();

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
  return getSearchableField(object, field, lowercaseSearchString);
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
  return (
    <Highlightable
      text={getSearchableField(object, field, query)}
      searchPattern={query.toLowerCase()}
    />
  );
};

export function getSearchableField(object: ObjectData, field: SearchableField, query?: string) {
  switch (field) {
    case SearchableField.AllNames:
      return (
        object.names.filter((name) => anyWordStartsWith(name, query?.toLowerCase() ?? ''))[0] ?? ''
      );
    case SearchableField.Code:
      return object.codeDisplay;
    case SearchableField.Endonym:
      return object.nameEndonym ?? '';
    case SearchableField.EngName:
      return object.nameDisplay;
    case SearchableField.NameOrCode:
    case SearchableField.Territory:
      return object.nameDisplay + ' [' + object.codeDisplay + ']';
  }
}

export function getObjectPopulation(
  object: ObjectData,
  includeDescendents?: boolean,
  languageSchema?: LanguageSchema,
): number {
  switch (object.type) {
    case ObjectType.Language:
      return (
        (object.populationCited ?? 0) +
        (includeDescendents && languageSchema
          ? (object.schemaSpecific[languageSchema].populationOfDescendents ?? 0)
          : 0)
      );
    case ObjectType.Locale:
      return object.populationSpeaking;
    case ObjectType.Census:
      return object.languageCount;
    case ObjectType.WritingSystem:
      return (
        object.populationUpperBound + (includeDescendents ? object.populationOfDescendents : 0)
      );
    case ObjectType.Territory:
      return object.population;
    default:
      return 0; // Default case for other types
  }
}
