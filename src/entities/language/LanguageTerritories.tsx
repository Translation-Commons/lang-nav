import React, { useMemo } from 'react';

import MiniCardList from '@widgets/cardlists/MiniCardList';
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
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { uniqueBy } from '@shared/lib/setUtils';

type Props = {
  lang: LanguageData;
  view: View;
};

const LanguageTerritories: React.FC<Props> = ({ lang, view }) => {
  const locales = useMemo(
    () =>
      uniqueBy(
        (lang.locales ?? [])
          .filter(
            (l) =>
              l.territoryCode &&
              l.writingSystem == null &&
              l.territory?.scope === TerritoryScope.Country,
          )
          .sort(sortByPopulation),
        (l) => l.territoryCode || '',
      ),
    [lang.locales],
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
    view,
  };
  if (lang.scope && !languageScopes.includes(lang.scope))
    params.languageScopes = [...languageScopes, lang.scope];

  return (
    <LocalParamsProvider overrides={params}>
      <div className="text-xs">
        {view === View.CardList && (
          <MiniCardList ents={uniqueBy(locales, (l) => l.territoryCode || '')} />
        )}
        {view === View.Map && (
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
        {view === View.Table && <Table locales={locales} />}
      </div>
    </LocalParamsProvider>
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

export default LanguageTerritories;
