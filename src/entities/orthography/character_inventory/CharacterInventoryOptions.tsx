import { ArrowDownNarrowWideIcon, ArrowDownWideNarrowIcon, ChevronLeftIcon } from 'lucide-react';
import React from 'react';

import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import FilterButton from '@features/transforms/filtering/FilterButton';

import EnumDropdown from '@shared/ui/EnumDropdown';
import { Toggle } from '@shared/ui/toggle';

import { useCharacterInventoryParams } from './CharacterInventoryContext';
import { CharVisibility, SortCharsBy, SortEntriesBy } from './CharacterInventoryTypes';

const CharacterInventoryOptions: React.FC = () => {
  const { sortBy } = usePageParams();
  const [showOptions, setShowOptions] = React.useState<boolean>(false);
  const {
    sortCharsBy,
    charVisibility,
    sortEntriesBy,
    setSortCharsBy,
    setCharVisibility,
    setSortEntriesBy,
  } = useCharacterInventoryParams();

  return (
    <div className="flex flex-row gap-2">
      <Toggle
        pressed={showOptions}
        onPressedChange={() => setShowOptions((prev) => !prev)}
        variant="outline"
        className="peer group shrink-0"
      >
        Options
        <ChevronLeftIcon className="group-aria-pressed:rotate-[180deg] transition-transform duration-300" />
      </Toggle>
      <div className="truncate max-h-0 transition-all transition-discrete duration-300 ease-in-out  peer-aria-pressed:max-h-40">
        <table>
          <tbody>
            <tr>
              <th>Writing system</th>
              <td>
                <FilterButton field={Field.WritingSystem} />
              </td>
            </tr>
            <tr>
              <th>Sort entries by</th>
              <td>
                <EnumDropdown
                  value={sortEntriesBy}
                  onChange={setSortEntriesBy}
                  options={Object.values(SortEntriesBy)}
                  getLabel={(option) => getSortEntriesByLabel(option, sortBy)}
                  getIcon={getSortEntriesIcon}
                />
              </td>
            </tr>
            <tr>
              <th>Sort characters by</th>
              <td>
                <EnumDropdown
                  value={sortCharsBy}
                  onChange={setSortCharsBy}
                  options={Object.values(SortCharsBy)}
                />
              </td>
            </tr>
            <tr>
              <th>Character column focus</th>
              <td>
                <EnumDropdown
                  value={charVisibility}
                  onChange={setCharVisibility}
                  options={Object.values(CharVisibility)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

function getSortEntriesByLabel(option: SortEntriesBy, sortBy: string) {
  switch (option) {
    case SortEntriesBy.PageSort:
      return `Page Sort (${sortBy})`;
    case SortEntriesBy.CharacterCount:
      return 'Character Count (descending)';
    case SortEntriesBy.CharacterCountInverse:
      return 'Character Count (ascending)';
  }
}

function getSortEntriesIcon(option: SortEntriesBy) {
  switch (option) {
    case SortEntriesBy.CharacterCount:
      return ArrowDownWideNarrowIcon;
    case SortEntriesBy.CharacterCountInverse:
      return ArrowDownNarrowWideIcon;
    default:
      return undefined;
  }
}

export default CharacterInventoryOptions;
