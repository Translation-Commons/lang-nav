import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay, useSelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import { getSortBysApplicableToObjectType } from '@features/transforms/sorting/sort';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { ScaleBy } from './ScaleTypes';

const ScaleBySelector: React.FC = () => {
    const { scaleBy, updatePageParams, objectType } = usePageParams();
    const { display } = useSelectorDisplay();

    const applicableScaleBys = getSortBysApplicableToObjectType(objectType);
    const scaleByOptions: ScaleBy[] = ['None', ...Object.values(SortBy).filter((s) => applicableScaleBys.includes(s))];

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
