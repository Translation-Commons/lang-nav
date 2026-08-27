import { FilterIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import CardInCardList from '@widgets/cardlists/CardInCardList';
import ResponsiveGrid from '@widgets/cardlists/ResponsiveGrid';

import useEntities from '@features/data/context/useEntities';
import LimitInput from '@features/pagination/LimitInput';
import PaginationControls from '@features/pagination/PaginationControls';
import usePagination from '@features/pagination/usePagination';
import { EntityType } from '@features/params/PageParamTypes';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { LanguageData, LanguageField } from '@entities/language/LanguageTypes';
import EntityCard from '@entities/ui/EntityCard';

import { Toggle } from '@shared/ui/toggle';

const ReportLocalesLanguagesWithout: React.FC = () => {
  const ents = useEntities(EntityType.Language) as LanguageData[];
  const { getCurrentEntities } = usePagination<LanguageData>();
  const [shouldFilterDeprecatedISO, setShouldFilterDeprecatedISO] = React.useState(true);
  const filteredLangs = useFilteredEntities({ useScope: false, inputEnts: ents }).filteredEntities;

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
    <>
      The report shows all languages that do not have any associated locales (language + territory
      combinations). We should research and add new locales for these, particularly ISO locales.
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em', marginTop: '1em' }}>
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
      <div style={{ marginTop: '1em', marginBottom: '1em' }}>
        <ResponsiveGrid>
          {getCurrentEntities(langs).map((lang) => (
            <CardInCardList key={lang.ID} ent={lang}>
              <EntityCard ent={lang} />
            </CardInCardList>
          ))}
        </ResponsiveGrid>
      </div>
    </>
  );
};

export default ReportLocalesLanguagesWithout;
