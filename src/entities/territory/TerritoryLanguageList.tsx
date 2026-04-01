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

import { TerritoryData } from './TerritoryTypes';

type Props = {
  territory: TerritoryData;
};

const TerritoryLanguageList: React.FC<Props> = ({ territory }) => {
  return (
    <LocalParamsProvider overrides={{ territoryScopes: [territory.scope], territoryFilter: '' }}>
      <TerritoryLanguageListContents territory={territory} />
    </LocalParamsProvider>
  );
};

const TerritoryLanguageListContents: React.FC<Props> = ({ territory }) => {
  const locales = territory.locales ?? [];
  const filteredLocales = useFilteredObjects({ inputObjects: locales })
    .filteredObjects as LocaleData[];

  if (locales.length === 0) return <Deemphasized>Unknown</Deemphasized>;
  const numberOfLanguages = countBy(locales, (loc) => loc.languageCode);
  const numberOfFilteredLanguages = countBy(filteredLocales, (loc) => loc.languageCode);

  return locales.length > 0 ? (
    <CommaSeparated>
      {uniqueBy(filteredLocales, (loc) => loc.languageCode).map((locale) => (
        <HoverableObjectName key={locale.ID} labelSource="language" object={locale} />
      ))}
      {numberOfLanguages > numberOfFilteredLanguages && (
        <Hoverable hoverContent={<FilterBreakdown objects={locales} />}>
          +{(numberOfLanguages - numberOfFilteredLanguages).toLocaleString()}
        </Hoverable>
      )}
    </CommaSeparated>
  ) : (
    <Deemphasized>Unknown</Deemphasized>
  );
};

export default TerritoryLanguageList;
