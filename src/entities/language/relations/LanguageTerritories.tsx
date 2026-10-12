import React, { useMemo } from 'react';

import MiniCardList from '@widgets/cardlists/MiniCardList';

import EntityMap from '@features/map/EntityMap';
import InternalLink from '@features/params/InternalLink';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { PageParams, View } from '@features/params/PageParamTypes';
import { ColorGradient } from '@features/transforms/coloring/ColorTypes';
import Field from '@features/transforms/fields/Field';
import { getFilterEntityID } from '@features/transforms/filtering/FilterEntityID';
import { BLANK_FILTER_PARAMS } from '@features/transforms/filtering/FilterParams';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import LocaleTable from '@entities/locale/LocaleTable';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityType } from '@entities/types/EntityTypes';

import { uniqueBy } from '@shared/lib/setUtils';

import { type LanguageData } from '../LanguageTypes';

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

  if (locales.length === 0) return null;

  const params: Partial<PageParams> = {
    entType: EntityType.Locale,
    sortBy: Field.Population,
    colorBy: Field.PercentOfTerritoryPopulation,
    colorGradient: ColorGradient.SequentialBlue,
    view,
    limit: 12,

    ...BLANK_FILTER_PARAMS,

    languageFilter: getFilterEntityID(lang),
    territoryScopes: [TerritoryScope.Country, TerritoryScope.Dependency],
  };

  return (
    <LocalParamsProvider overrides={params}>
      <div className="text-xs">
        {view === View.CardList && (
          <MiniCardList
            ents={uniqueBy(locales, (l) => l.territoryCode || '')}
            labelSource="territory"
          />
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
        {view === View.Table && <LocaleTable />}
      </div>
    </LocalParamsProvider>
  );
};

export default LanguageTerritories;
