export enum SortCharsBy {
  Count = 'Count',
  Codepoint = 'Codepoint',
  Alphabetical = 'Alphabetical',
}

export enum SortEntriesBy {
  PageSort = 'Page sort',
  CharacterCount = 'Character count',
  CharacterCountInverse = 'Character count low to high',
}

export enum CharVisibility {
  TopCount = 'Most common',
  CommonOverall = 'Common, over all languages',
  CommonWithinVisible = 'Common, within visible entries',
  ConflictsOverall = 'Conflicts, over all languages',
  ConflictsWithinVisible = 'Conflicts, within visible entries',
  ShowAll = 'Show all',
}
