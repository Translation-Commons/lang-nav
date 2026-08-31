import { SquareArrowUpLeftIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import MiniCardList from '@widgets/cardlists/MiniCardList';
import { getViewIcon } from '@widgets/controls/selectors/ViewSelector';
import DetailsSection from '@widgets/details/ui/DetailsSection';
import { getEntityFullDescendants } from '@widgets/pathnav/getParentsAndDescendants';
import getLanguageColumns from '@widgets/tables/columns/LanguageColumns';
import { getLanguageTreeNodes } from '@widgets/treelists/LanguageHierarchy';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityMap from '@features/map/EntityMap';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { EntityType, PageParams, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';
import { getSortFunction } from '@features/transforms/sorting/sort';
import TreeListRoot from '@features/treelist/TreeListRoot';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import { partition } from '@shared/lib/setUtils';
import { Button } from '@shared/ui/button';
import CommaSeparated from '@shared/ui/CommaSeparated';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

const LanguageDetailsDialects: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { updatePageParams } = usePageParams();
  const [sectionView, setSectionView] = useState(View.Map);
  const sortFunction = getSortFunction();

  const dialects = useMemo(
    () =>
      getEntityFullDescendants(lang)
        .filter(
          (l) =>
            l.type === EntityType.Language &&
            (l.scope === LanguageScope.Dialect || l.scope === LanguageScope.Language),
        )
        .sort(sortFunction) as LanguageData[],
    [lang],
  );

  return (
    <DetailsSection
      startCollapsed={true}
      score={dialects.length}
      title="Dialects"
      headerOptions={
        <Tabs value={sectionView} onValueChange={setSectionView}>
          <TabsList>
            {Object.values([View.CardList, View.Hierarchy, View.Table, View.Map]).map((v) => (
              <TabsTrigger key={v} value={v} className="cursor-pointer">
                {getViewIcon(v)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <div className="text-xs">
        These dialects come from ISO or Glottolog -- there very likely are more dialects (help us
        out by feedback in the top-right).
      </div>
      <div className="text-xs">
        {/* Show inner views with local params to customize this for the language without interfering with explore surface params */}
        <LocalParamsProvider
          overrides={{
            limit: -1,
            entType: EntityType.Language,
            sortBy: Field.Population,
            searchString: '',
            view: sectionView,
            languageFilter: '',
            languageScopes: [],
          }}
        >
          {sectionView === View.Map && (
            <Maps lang={lang} updatePageParams={updatePageParams} dialects={dialects} />
          )}
          {sectionView === View.Hierarchy && <TreeList lang={lang} />}
          {sectionView === View.Table && <Table dialects={dialects} />}
          {sectionView === View.CardList && <MiniCardList ents={dialects} />}
        </LocalParamsProvider>
      </div>
    </DetailsSection>
  );
};

type MapsProps = {
  lang: LanguageData;
  dialects: LanguageData[];
  // Updating the global page params, not the local params
  updatePageParams: (newParams: Partial<PageParams>) => void;
};
function Maps({ lang, updatePageParams, dialects }: MapsProps) {
  const [dialectsWithCoords, dialectsWithoutCoords] = partition(
    [lang, ...dialects],
    (d) => d.latitude != null && d.longitude != null,
  );
  return (
    <div className="flex flex-col gap-2">
      <div>
        This map shows the center of the dialect. It does not capture every location that the
        dialect is used.{' '}
        <Button
          className="cursor-pointer"
          onClick={() =>
            updatePageParams({
              view: View.Map,
              languageFilter: lang.nameCanonical + ' [' + lang.ID + ']',
            })
          }
          variant="secondary"
        >
          <SquareArrowUpLeftIcon /> See the full map in the explore panel
        </Button>
      </div>
      <EntityMap entities={dialectsWithCoords} maxWidth={1000} />
      {dialectsWithoutCoords.length > 0 && (
        <div>
          Dialects without coordinates:{' '}
          <CommaSeparated>
            {dialectsWithoutCoords.map((d) => (
              <HoverableEntityName ent={d} key={d.ID} />
            ))}
          </CommaSeparated>
        </div>
      )}
    </div>
  );
}

function Table({ dialects }: { dialects: LanguageData[] }) {
  const columns = useMemo(() => getLanguageColumns(), []);

  return (
    <LocalParamsProvider overrides={{ limit: 12 }}>
      <InteractiveEntityTable<LanguageData>
        tableID={TableID.Languages}
        ents={dialects}
        columns={columns}
        shouldFilterUsingSearchBar={false}
      />
    </LocalParamsProvider>
  );
}

function TreeList({ lang }: { lang: LanguageData }) {
  const { languageSource } = usePageParams();
  const sortFunction = getSortFunction();
  const nodes = useMemo(
    () => getLanguageTreeNodes([lang], languageSource, sortFunction),
    [lang, languageSource, sortFunction],
  );
  return <TreeListRoot rootNodes={nodes} />;
}

export default LanguageDetailsDialects;
