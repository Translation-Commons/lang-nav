import { useEffect } from 'react';

import useCountries from '@features/data/context/useCountries';
import EntityMap from '@features/map/EntityMap';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import EntitySearchCombobox from '@features/transforms/search/EntitySearchCombobox';
import useIntroLandscapeTerritorySuggestions from '@features/transforms/search/useIntroLandscapeTerritorySuggestions';

import { EntityType } from '@entities/types/EntityTypes';

import { Toggle } from '@shared/ui/toggle';

import IntroLandscapeSidePanel from './IntroLandscapeSidePanel';

const LENSES: { field: Field; label: string }[] = [
  { field: Field.Population, label: 'Most spoken' },
  { field: Field.CountOfWritingSystems, label: 'Writing systems' },
  { field: Field.LanguageFamily, label: 'Language families' },
];

const IntroLandscapeByTerritory: React.FC = () => {
  const { colorBy, entType, updatePageParams } = usePageParams();
  const getSuggestions = useIntroLandscapeTerritorySuggestions();
  const countries = useCountries();

  useEffect(() => {
    if (entType !== EntityType.Territory) {
      updatePageParams({ entType: EntityType.Territory });
    }
  }, [entType, updatePageParams]);

  const onToggleLens = (field: Field) => {
    updatePageParams({ colorBy: colorBy === field ? Field.None : field });
  };

  return (
    <div className="grid w-full gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <EntitySearchCombobox
            getSuggestions={getSuggestions}
            onSelect={(value) => updatePageParams({ entID: value.entID })}
            placeholder="Search a country or territory..."
            ariaLabel="Search a country or territory"
            emptyMessage="No matches"
            className="h-9 min-w-[220px] flex-1 text-sm"
          />
          <div role="group" aria-label="Map lens" className="flex flex-wrap gap-2">
            {LENSES.map(({ field, label }) => (
              <Toggle
                key={field}
                variant="outline"
                pressed={colorBy === field}
                onPressedChange={() => onToggleLens(field)}
              >
                {label}
              </Toggle>
            ))}
          </div>
        </div>
        <EntityMap entities={countries} />
      </div>
      <IntroLandscapeSidePanel />
    </div>
  );
};

export default IntroLandscapeByTerritory;
