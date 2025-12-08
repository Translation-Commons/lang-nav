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

// TODO make better upperbound/lowerbound population estimates when we don't have exact numbers
export function getObjectPopulation(object: ObjectData): number {
  switch (object.type) {
    case ObjectType.Language:
      return object.populationEstimate ?? 0;
    case ObjectType.Locale:
      return object.populationSpeaking;
    case ObjectType.Census:
      return object.eligiblePopulation;
    case ObjectType.WritingSystem:
      return object.populationUpperBound;
    case ObjectType.Territory:
      return object.population;

    case ObjectType.VariantTag: {
      // For variant tags, attempt to return a cited population first (based on locale data),
      // otherwise fall back to an upper bound (based on language populations),
      // and finally fall back to summing language populations if no precomputed values exist.
      // We cast the object to VariantTagData so we can access the extra properties safely.
      const variant = object as any;
      const cited = variant.populationCited;
      if (typeof cited === 'number' && cited > 0) {
        return cited;
      }
      const upper = variant.populationUpperBound;
      if (typeof upper === 'number' && upper > 0) {
        return upper;
      }
      // Fallback: sum the populationCited values from associated languages
      return (variant.languages || []).reduce((sum: number, lang: any) => {
        return sum + (lang.populationCited || 0);
      }, 0);
    }

export function getObjectPopulationAttested(object: ObjectData): number {
  switch (object.type) {
    case ObjectType.Language:
      return object.populationCited ?? 0;
    case ObjectType.Locale:
      return object.populationCensus != null ? (object.populationSpeaking ?? 0) : 0;
    default:
      return 0;
  }
}

export function getObjectPopulationOfDescendents(
  object: ObjectData,
  languageSource?: LanguageSource,
): number {
  switch (object.type) {
    case ObjectType.Language:
      return languageSource
        ? (object.sourceSpecific[languageSource].populationOfDescendents ?? 0)
        : (object.populationOfDescendents ?? 0);
    case ObjectType.WritingSystem:
      return object.populationOfDescendents;
    default:
      return 0;
  }
}
