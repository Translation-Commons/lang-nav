import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay, useSelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import { getSortBysApplicableToObjectType } from '@features/transforms/sorting/sort';
import { SortBy } from '@features/transforms/sorting/SortTypes';
import { ObjectType } from '@features/params/PageParamTypes';

import { ScaleBy } from './ScaleTypes';

const ScaleBySelector: React.FC = () => {
    const { scaleBy, updatePageParams, objectType } = usePageParams();
    const { display } = useSelectorDisplay();

    const applicableScaleBys = getSortBysApplicableToObjectType(objectType);

    // Limit scale-by choices to only the fields we want to support for scaling
    const allowedScaleBys: SortBy[] = [
        SortBy.Population,
        SortBy.PopulationAttested,
        SortBy.CountOfLanguages,
        SortBy.CountOfTerritories,
    ];

    // Filter allowed options by what is applicable to the current object type
    let filteredAllowed = allowedScaleBys.filter((s) => applicableScaleBys.includes(s));

    // Exclude count-of-languages when mapping Languages, and exclude count-of-territories when mapping Territories
    if (objectType === ObjectType.Language) {
        filteredAllowed = filteredAllowed.filter((s) => s !== SortBy.CountOfLanguages);
    }
    if (objectType === ObjectType.Territory) {
        filteredAllowed = filteredAllowed.filter((s) => s !== SortBy.CountOfTerritories);
    }

    const scaleByOptions: ScaleBy[] = ['None', ...filteredAllowed];

    return (
        <Selector<ScaleBy>
            selectorLabel={display === SelectorDisplay.Dropdown ? 'Scale By' : undefined}
            selectorDescription="Choose a field to scale items by (map circles)."
            options={scaleByOptions}
            onChange={(scaleBy) => updatePageParams({ scaleBy })}
            selected={scaleBy}
        />
    );
};

export default ScaleBySelector;
