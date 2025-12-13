export type Suggestion = {
  objectID?: string;
  searchString: string;
  label: React.ReactNode;
  group?: string; // Used to label suggestions into groups, particularly when the primary search fails
};

export type GroupedSuggestions = { group: string; suggestions: Suggestion[] }[];

export const SUGGESTION_LIMIT = 10;
