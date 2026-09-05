import React, { useMemo, useState } from 'react';

import MiniCardList from '@widgets/cardlists/MiniCardList';
import { getViewIcon } from '@widgets/controls/selectors/ViewDisplay';
import DetailsSection from '@widgets/details/ui/DetailsSection';
import { getEntityFullDescendants } from '@widgets/pathnav/getParentsAndDescendants';
import getLanguageColumns from '@widgets/tables/columns/LanguageColumns';
import { getLanguageTreeNodes } from '@widgets/treelists/LanguageHierarchy';

import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { EntityType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';
import { getSortFunction } from '@features/transforms/sorting/sort';
import TreeListRoot from '@features/treelist/TreeListRoot';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import LanguageDialectsMap from '@entities/language/relations/LanguageDialectsMap';

import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

const LanguageDetailsDialects: React.FC<{ lang: LanguageData }> = ({ lang }) => {
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
    [lang, sortFunction],
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
        These dialects come from ISO or Glottolog. Likely, there are more dialects but we are
        waiting for them to be codified by a recognized authority first.
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
          {sectionView === View.Map && <LanguageDialectsMap lang={lang} />}
          {sectionView === View.Hierarchy && <TreeList lang={lang} />}
          {sectionView === View.Table && <Table dialects={dialects} />}
          {sectionView === View.CardList && <MiniCardList ents={dialects} />}
        </LocalParamsProvider>
      </div>
    </DetailsSection>
  );
};

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
