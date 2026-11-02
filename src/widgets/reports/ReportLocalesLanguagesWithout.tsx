import { FilterIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import CardInCardList from '@widgets/cardlists/CardInCardList';
import CardTitle from '@widgets/cardlists/CardTitle';
import ResponsiveGrid from '@widgets/cardlists/ResponsiveGrid';

import useEntities from '@features/data/context/useEntities';
import LimitInput from '@features/pagination/LimitInput';
import PaginationControls from '@features/pagination/PaginationControls';
import usePagination from '@features/pagination/usePagination';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { type LanguageData, LanguageField } from '@entities/language/LanguageTypes';
import { EntityType } from '@entities/types/EntityTypes';
import EntityCard from '@entities/ui/EntityCard';

import { Toggle } from '@shared/ui/toggle';

const ReportLocalesLanguagesWithout: React.FC = () => {
  const ents = useEntities(EntityType.Language) as LanguageData[];
  const { getCurrentEntities } = usePagination<LanguageData>();
  const [shouldFilterDeprecatedISO, setShouldFilterDeprecatedISO] = React.useState(true);
  const filteredLangs = useFilteredEntities({ inputEnts: ents }).filteredEntities;

  const langs = useMemo(
    () =>
      filteredLangs.filter(
        (lang) =>
          !lang.locales?.length &&
          (!shouldFilterDeprecatedISO || !lang.warnings?.[LanguageField.isoCode]),
      ),
    [filteredLangs, shouldFilterDeprecatedISO],
  );

  return (
    <div className="flex flex-col gap-4">
      The report shows all languages that do not have any associated locales (language + territory
      combinations). We should research and add new locales for these, particularly ISO locales.
      <div className="flex items-center gap-4">
        <LimitInput />
        <div>
          <PaginationControls itemCount={langs.length} />
        </div>
        <Toggle
          className="cursor-pointer"
          pressed={shouldFilterDeprecatedISO}
          onPressedChange={() => setShouldFilterDeprecatedISO(!shouldFilterDeprecatedISO)}
        >
          <FilterIcon className="group-aria-pressed/toggle:fill-foreground" />
          Filter deprecated ISO
        </Toggle>
      </div>
      <ResponsiveGrid>
        {getCurrentEntities(langs).map((lang) => (
          <CardInCardList key={lang.ID} ent={lang}>
            <div className="flex flex-col gap-2">
              <CardTitle ent={lang} />
              <EntityCard ent={lang} />
            </div>
          </CardInCardList>
        ))}
      </ResponsiveGrid>
    </div>
  );
};

export default ReportLocalesLanguagesWithout;
