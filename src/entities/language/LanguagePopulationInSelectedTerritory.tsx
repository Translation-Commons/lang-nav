import { CircleAlertIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';
import HoverableObject from '@features/hovercard/HoverableObject';
import usePageParams from '@features/params/usePageParams';
import { getFilterByTerritory } from '@features/transforms/filtering/filterByConnections';

import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageData } from './LanguageTypes';

const LanguagePopulationInSelectedTerritory: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { territoryFilter } = usePageParams();
  if (!territoryFilter) {
    return (
      <Hoverable hoverContent="Select a territory in the filters in the sidebar">
        <CircleAlertIcon size="1em" />
      </Hoverable>
    );
  }

  // Get the locales associated with the language
  const filterByTerritory = getFilterByTerritory();
  const locales = lang.locales.filter(filterByTerritory);
  if (locales.length === 0) return <Deemphasized>—</Deemphasized>;

  // Find the locale with the highest population -- because sometimes there are multiple locales
  // for the same territory & language combination (eg. pan_PK and pan_Arab_PK for Punjabi in Pakistan)
  const biggestLocale = locales.reduce(
    (biggest, locale) =>
      (locale.populationAdjusted ?? 0) > (biggest.populationAdjusted ?? 0) ? locale : biggest,
    locales[0],
  );

  return (
    <HoverableObject object={biggestLocale}>
      {Math.max(...locales.map((locale) => locale.populationAdjusted ?? 0)).toLocaleString()}
    </HoverableObject>
  );
};

export default LanguagePopulationInSelectedTerritory;
