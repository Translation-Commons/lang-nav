import { EntityData } from '@entities/types/DataTypes';

export type Suggestion = {
  entID?: string;
  searchString: string;
  label: React.ReactNode;
  ent: EntityData;
  group?: string; // Used to label suggestions into groups, particularly when the primary search fails
};

export type GroupedSuggestions = { group: string; suggestions: Suggestion[] }[];

export const SUGGESTION_LIMIT = 10;
