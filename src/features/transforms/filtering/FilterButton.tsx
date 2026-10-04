import { XIcon } from 'lucide-react';

import usePageParams from '@features/params/usePageParams';

import { LanguageScope } from '@entities/language/LanguageTypes';
import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { LanguageModality } from '@entities/language/writing/LanguageModality';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { Button } from '@shared/ui/button';
import EnumDropdownMultiSelect from '@shared/ui/EnumDropdownMultiselect';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import Field from '../fields/Field';
import { FilterField } from '../fields/FieldApplicability';

import { useFilterLabels } from './FilterLabels';
import FilterSelector from './selectors/FilterSelector';
import useRemoveFilter from './useRemoveFilter';

type Props = {
  field: FilterField;
};

/**
 * Show buttons to control files, for example:
 *
 * [Extinct v]
 * [Macrolanguage, Language, or Dialect v]
 * [In United States x]
 * [Name matches "n" x]
 */
function FilterButton({ field }: Props) {
  const { modalityFilter, languageScopes, updatePageParams, isoStatus, territoryScopes } =
    usePageParams();

  switch (field) {
    case Field.Modality:
      return (
        <EnumDropdownMultiSelect<LanguageModality>
          value={modalityFilter}
          onChange={(newValue: LanguageModality[]) =>
            updatePageParams({ modalityFilter: newValue })
          }
          getLabel={(v) => getModalityLabel(v) ?? ''}
          options={Object.values(LanguageModality).filter((s) => typeof s === 'number')}
          noneSelectedLabel="Any language use"
          allSelectedLabel="Any language use"
        />
      );
    case Field.LanguageScope:
      return (
        <EnumDropdownMultiSelect<LanguageScope>
          value={languageScopes}
          onChange={(newValue: LanguageScope[]) => updatePageParams({ languageScopes: newValue })}
          getLabel={getLanguageScopeLabel}
          options={Object.values(LanguageScope).filter((s) => typeof s === 'number')}
          noneSelectedLabel="Any language, language family, or dialect"
          allSelectedLabel="Any language, language family, or dialect"
        />
      );
    case Field.ISOStatus:
      return (
        <EnumDropdownMultiSelect<LanguageISOStatus>
          value={isoStatus}
          onChange={(newValue: LanguageISOStatus[]) => updatePageParams({ isoStatus: newValue })}
          getLabel={getLanguageISOStatusLabel}
          options={Object.values(LanguageISOStatus).filter((s) => typeof s === 'number')}
          noneSelectedLabel="Any status"
          allSelectedLabel="Any status"
        />
      );
    case Field.TerritoryScope:
      return (
        <EnumDropdownMultiSelect<TerritoryScope>
          value={territoryScopes}
          onChange={(newValue: TerritoryScope[]) => updatePageParams({ territoryScopes: newValue })}
          getLabel={getTerritoryScopeLabel}
          options={Object.values(TerritoryScope).filter((s) => typeof s === 'number')}
          noneSelectedLabel="Any territory"
          allSelectedLabel="Any territory"
        />
      );
    case Field.SourceForLanguage:
    case Field.Population:
    case Field.Name:
    case Field.WritingSystem:
    case Field.LanguageList:
    case Field.LanguageFamily:
    case Field.Organization:
    case Field.TerritoryList:
      return <FilterToggle field={field} />;
    default:
      enforceExhaustiveSwitch(field);
  }
}

function FilterToggle({ field }: { field: FilterField }) {
  const removeFilter = useRemoveFilter();
  const filterLabels = useFilterLabels();
  return (
    <Popover>
      <PopoverTrigger
        render={
          // Would be a button but buttons cannot contain buttons
          <div
            className="rounded-md py-1 pr-1 pl-2 flex flex-row gap-1 items-center font-medium border border-border hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30 cursor-pointer"
            title={filterLabels[field]}
          >
            <div className="max-w-40 truncate text-ellipsis">{filterLabels[field]}</div>
            <Button
              data-testid="remove-filter-button"
              onClick={() => removeFilter(field)}
              variant="ghost"
              className="size-5 hover:bg-gray-200"
            >
              <XIcon />
            </Button>
          </div>
        }
      />
      <PopoverContent>
        <FilterSelector field={field} />
      </PopoverContent>
    </Popover>
  );
}

export default FilterButton;
