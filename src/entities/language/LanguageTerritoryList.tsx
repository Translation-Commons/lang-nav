import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';

import { LocaleData } from '@entities/locale/LocaleTypes';

import { countBy, uniqueBy } from '@shared/lib/setUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageData } from './LanguageTypes';

type Props = {
  lang: LanguageData;
};

const LanguageTerritoryList: React.FC<Props> = ({ lang }) => {
  return (
    <LocalParamsProvider
      overrides={{ languageScopes: lang.scope ? [lang.scope] : [], languageFilter: '' }}
    >
      <LanguageTerritoryListContents lang={lang} />
    </LocalParamsProvider>
  );
};

const LanguageTerritoryListContents: React.FC<Props> = ({ lang }) => {
  const locales = lang.locales?.filter((loc) => loc.territoryCode != null) ?? [];
  const filteredLocales = useFilteredObjects({ inputObjects: locales })
    .filteredObjects as LocaleData[];

  if (locales.length === 0) return <Deemphasized>Unknown</Deemphasized>;
  const numberOfTerritories = countBy(locales, (loc) => loc.territoryCode ?? '');
  const numberOfFilteredTerritories = countBy(filteredLocales, (loc) => loc.territoryCode ?? '');

  return locales.length > 0 ? (
    <CommaSeparated>
      {uniqueBy(filteredLocales, (loc) => loc.territoryCode ?? '').map((locale) => (
        <HoverableObjectName key={locale.ID} labelSource="territory" object={locale} />
      ))}
      {numberOfTerritories > numberOfFilteredTerritories && (
        <Hoverable hoverContent={<FilterBreakdown objects={locales} />}>
          +{(numberOfTerritories - numberOfFilteredTerritories).toLocaleString()}
        </Hoverable>
      )}
    </CommaSeparated>
  ) : (
    <Deemphasized>Unknown</Deemphasized>
  );
};

export default LanguageTerritoryList;
