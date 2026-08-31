import React, { useMemo } from 'react';

import MiniCardList from '@widgets/cardlists/MiniCardList';
import { getViewIcon } from '@widgets/controls/selectors/ViewSelector';
import DetailsSection from '@widgets/details/ui/DetailsSection';
import getLocaleColumns from '@widgets/tables/columns/LocaleColumns';

import EntityMap from '@features/map/EntityMap';
import InternalLink from '@features/params/InternalLink';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { EntityType, PageParams, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import { ColorGradient } from '@features/transforms/coloring/ColorTypes';
import Field from '@features/transforms/fields/Field';
import useFilters from '@features/transforms/filtering/useFilters';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';

import { uniqueBy } from '@shared/lib/setUtils';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

const LanguageDetailsTerritories: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const sortFunction = getSortFunction();
  const filterByScope = useFilters()[Field.TerritoryScope];
  const [sectionView, setSectionView] = React.useState(View.CardList);

  const locales = useMemo(
    () =>
      uniqueBy(
        (lang.locales ?? [])
          .filter((l) => filterByScope(l) && l.territoryCode && l.writingSystem == null)
          .sort(sortFunction),
        (l) => l.territoryCode || '',
      ),
    [lang.locales, filterByScope, sortFunction],
  );

  const { languageScopes } = usePageParams();

  if (locales.length === 0) return null;

  const params: Partial<PageParams> = {
    entType: EntityType.Locale,
    languageFilter: lang.nameCanonical + ' [' + lang.ID + ']',
    sortBy: Field.Population,
    colorBy: Field.PercentOfTerritoryPopulation,
    colorGradient: ColorGradient.SequentialBlue,
    searchString: '',
    view: View.Map,
  };
  if (lang.scope && !languageScopes.includes(lang.scope))
    params.languageScopes = [...languageScopes, lang.scope];

  return (
    <DetailsSection
      score={locales.length}
      startCollapsed={true}
      title="Territories"
      headerOptions={
        <Tabs value={sectionView} onValueChange={setSectionView}>
          <TabsList>
            {Object.values([View.CardList, View.Table, View.Map]).map((v) => (
              <TabsTrigger key={v} value={v} className="cursor-pointer">
                {getViewIcon(v)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <LocalParamsProvider overrides={params}>
        <div className="text-xs">
          {sectionView === View.CardList && (
            <MiniCardList ents={uniqueBy(locales, (l) => l.territoryCode || '')} />
          )}
          {sectionView === View.Map && (
            <>
              <div>
                This map shows all territories with this language, colored by the percentage of the
                territory&apos;s population that uses it. Hover to see values.{' '}
                <InternalLink className="inline" params={params}>
                  [See full map in explore panel]
                </InternalLink>
              </div>
              <EntityMap entities={locales} maxWidth={1000} />
            </>
          )}
          {sectionView === View.Table && <Table locales={locales} />}
        </div>
      </LocalParamsProvider>
    </DetailsSection>
  );
};

function Table({ locales }: { locales: LocaleData[] }) {
  const columns = useMemo(() => getLocaleColumns(), []);

  return (
    <LocalParamsProvider overrides={{ limit: 12 }}>
      <InteractiveEntityTable<LocaleData>
        tableID={TableID.Locales}
        ents={locales}
        columns={columns}
        shouldFilterUsingSearchBar={false}
      />
    </LocalParamsProvider>
  );
}

export default LanguageDetailsTerritories;
