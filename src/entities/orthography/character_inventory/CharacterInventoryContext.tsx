import React, { PropsWithChildren, useMemo } from 'react';

import { CharVisibility, SortCharsBy, SortEntriesBy } from './CharacterInventoryTypes';

type CharacterInventoryParams = {
  charVisibility: CharVisibility;
  sortCharsBy: SortCharsBy;
  sortEntriesBy: SortEntriesBy;

  setCharVisibility: (charVisibility: CharVisibility) => void;
  setSortCharsBy: (sortCharsBy: SortCharsBy) => void;
  setSortEntriesBy: (sortEntriesBy: SortEntriesBy) => void;
};

const CharacterInventoryParamsContext = React.createContext<CharacterInventoryParams | undefined>(
  undefined,
);

const CharacterInventoryParamsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [sortCharsBy, setSortCharsBy] = React.useState<SortCharsBy>(SortCharsBy.Codepoint);
  const [charVisibility, setCharVisibility] = React.useState<CharVisibility>(
    CharVisibility.TopCount,
  );
  const [sortEntriesBy, setSortEntriesBy] = React.useState<SortEntriesBy>(SortEntriesBy.PageSort);

  const providerValue: CharacterInventoryParams = useMemo(
    () => ({
      sortCharsBy,
      charVisibility,
      sortEntriesBy,
      setSortCharsBy,
      setCharVisibility,
      setSortEntriesBy,
    }),
    [
      sortCharsBy,
      charVisibility,
      sortEntriesBy,
      setSortCharsBy,
      setCharVisibility,
      setSortEntriesBy,
    ],
  );

  return (
    <CharacterInventoryParamsContext.Provider value={providerValue}>
      {children}
    </CharacterInventoryParamsContext.Provider>
  );
};

export const useCharacterInventoryParams = (): CharacterInventoryParams => {
  const context = React.useContext(CharacterInventoryParamsContext);
  if (context) return context;
  throw new Error(
    'useCharacterInventoryParams must be used within a CharacterInventoryParamsProvider',
  );
};

export default CharacterInventoryParamsProvider;
