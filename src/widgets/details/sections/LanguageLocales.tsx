import { LanguageData } from "@entities/language/LanguageTypes";
import LocaleGrid from '@entities/locale/LocaleGrid';
import Field from '@features/transforms/fields/Field';
import useFilters from '@features/transforms/filtering/useFilters';
import { getSortFunction } from '@features/transforms/sorting/sort';
import React from "react";

const LanguageLocales: React.FC<{ lang: LanguageData }> = ({ lang }) => {
    const sortFunction = getSortFunction();
    const filterByScope = useFilters()[Field.TerritoryScope];
    return (
        <LocaleGrid locales={(lang.locales ?? []).filter(filterByScope).sort(sortFunction)} />
    );
};

export default LanguageLocales;


