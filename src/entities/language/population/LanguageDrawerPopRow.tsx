import React from 'react';

import DrawerActionButton from '@widgets/details/ui/DrawerActionButton';
import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';

import { EntityType, PageParams, View } from '@features/params/PageParamTypes';

import SimpleLocaleTable from '@entities/locale/SimpleLocaleTable';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

import { sortBy, uniqueBy } from '@shared/lib/setUtils';
import { toTitleCase } from '@shared/lib/stringUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';

import { getLanguageModalityUserLabel } from '@strings/LanguageModalityStrings';

import { LanguageData, LanguageScope } from '../LanguageTypes';

type LanguageDrawerPopRowProps = {
  lang: LanguageData;
  populationFocus: PopulationFocus;
};

const LanguageDrawerPopRow: React.FC<LanguageDrawerPopRowProps> = ({ lang, populationFocus }) => {
  const baseParams: Partial<PageParams> = {
    entType: EntityType.Locale,
    entID: lang.ID, // Kept the drawer open, letting people manually close it
    populationFocus,
    languageFilter: lang.nameDisplay + ' [' + lang.ID + ']',
  };
  if (lang.scope === LanguageScope.Family) {
    baseParams.languageScopes = [];
    if (!lang.ISO.code) {
      baseParams.languageFamilyFilter = lang.nameDisplay + ' [' + lang.ID + ']';
      baseParams.languageFilter = '';
    }
  }

  const speakingOrWriting = populationFocus === PopulationFocus.Speaking ? 'speaking' : 'writing';
  const popEstimate = lang.pop[speakingOrWriting].estimate;
  const hasLocalesWithData = lang.locales?.some((l) => l.pop[speakingOrWriting].adjusted != null);

  if (!popEstimate && !hasLocalesWithData) {
    return (
      <DrawerDetailsField
        label={toTitleCase(getLanguageModalityUserLabel(lang.modality, speakingOrWriting))}
        hasData={false}
      >
        No data available
      </DrawerDetailsField>
    );
  }

  const showableLocales = uniqueBy(
    sortBy(
      lang.locales.filter(
        (l) =>
          l.territory?.scope === TerritoryScope.Country ||
          l.territory?.scope === TerritoryScope.Dependency,
      ),
      (l) => l.pop[speakingOrWriting].adjusted,
    ),
    (l) => l.territoryCode ?? '',
  );

  return (
    <DrawerDetailsField
      label={toTitleCase(getLanguageModalityUserLabel(lang.modality, speakingOrWriting))}
      actions={
        showableLocales.length > 0 && [
          <DrawerActionButton key="map" view={View.Map} baseParams={baseParams} />,
          <DrawerActionButton key="table" view={View.Table} baseParams={baseParams} />,
        ]
      }
      expandedContent={
        showableLocales.length > 0 && (
          <SimpleLocaleTable
            locales={showableLocales}
            populationFocus={populationFocus}
            labelSource="territory"
          />
        )
      }
    >
      <CountOfPeople count={popEstimate} />
    </DrawerDetailsField>
  );
};

export default LanguageDrawerPopRow;
