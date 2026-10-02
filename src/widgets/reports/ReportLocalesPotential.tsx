import React, { useCallback } from 'react';

import usePagination from '@features/pagination/usePagination';
import useAllFilters from '@features/transforms/filtering/useAllFilters';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { LocaleData } from '@entities/locale/LocaleTypes';
import getLocaleExportString from '@entities/locale/potential/getLocaleExportString';
import PotentialLocalesTab from '@entities/locale/potential/PotentialLocalesTab';
import PotentialLocalesTable from '@entities/locale/potential/PotentialLocalesTable';
import usePotentialLocales from '@entities/locale/potential/usePotentialLocales';
import usePotentialLocalesFilters from '@entities/locale/potential/usePotentialLocalesFilters';

import { Badge } from '@shared/ui/badge';
import CopyButton from '@shared/ui/CopyButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs';

import {
  getPotentialLocalesTabTitle,
  PotentialLocalesTabDescription,
} from '@strings/PotentialLocalesStrings';

const ReportLocalesPotential: React.FC = () => {
  const [currentTab, setCurrentTab] = React.useState(PotentialLocalesTab.Largest);
  const { FilterComponent, isPercentEnough } = usePotentialLocalesFilters();
  const potentialLocales = usePotentialLocales(isPercentEnough);

  return (
    <div className="flex flex-col gap-4">
      <p>
        This page lists locales from Census data that are not in the list of defined locales. There
        are too many possible combinations of language + territory + variation information, so the
        number of actualized locales is smaller than the possible ones. However ones that appear
        here may be worth considering.
      </p>
      {FilterComponent}
      <Tabs
        value={currentTab}
        onValueChange={(value) => setCurrentTab(value as PotentialLocalesTab)}
      >
        <TabsList variant="line" className="border-b-2">
          {Object.values(PotentialLocalesTab).map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-lg -mb-[2px]">
              {getPotentialLocalesTabTitle(tab)}
              <Badge variant={potentialLocales[tab].length > 0 ? 'default' : 'outline'}>
                {potentialLocales[tab].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.values(PotentialLocalesTab).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <SubReport tab={tab} localeSets={potentialLocales} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const SubReport: React.FC<{
  tab: PotentialLocalesTab;
  localeSets: Record<PotentialLocalesTab, LocaleData[]>;
}> = ({ tab, localeSets }) => {
  const locales = localeSets[tab];
  const filter = useAllFilters();
  const sortFunction = getSortFunction();
  const { getCurrentEntities } = usePagination<LocaleData>();

  const getExportLocales = useCallback(
    () =>
      getCurrentEntities(locales.filter(filter).sort(sortFunction))
        .map(getLocaleExportString)
        .join(''),
    [locales, filter, sortFunction, getCurrentEntities],
  );

  return (
    <div className="flex flex-col gap-2">
      <PotentialLocalesTabDescription tab={tab} />
      <div>
        <CopyButton getTextToCopy={getExportLocales}>
          Copy visible locales for locales.tsv
        </CopyButton>
      </div>
      <div className="h-fit">
        <PotentialLocalesTable locales={locales} />
      </div>
    </div>
  );
};

export default ReportLocalesPotential;
