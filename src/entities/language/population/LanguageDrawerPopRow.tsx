import React from 'react';

import DrawerActionButton from '@widgets/details/ui/DrawerActionButton';
import { DrawerDetailsField } from '@widgets/details/ui/DrawerDetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { EntityType, PageParams, View } from '@features/params/PageParamTypes';

import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

import { sortBy, uniqueBy } from '@shared/lib/setUtils';
import { toTitleCase } from '@shared/lib/stringUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';

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
          <LocalParamsProvider overrides={{ populationFocus }}>
            <LocaleTable showableLocales={showableLocales} speakingOrWriting={speakingOrWriting} />
          </LocalParamsProvider>
        )
      }
    >
      <CountOfPeople count={popEstimate} />
    </DrawerDetailsField>
  );
};

const LocaleTable: React.FC<{
  showableLocales: LocaleData[];
  speakingOrWriting: 'speaking' | 'writing';
}> = ({ showableLocales, speakingOrWriting }) => {
  return (
    <table className="w-fit">
      <tbody>
        {showableLocales.slice(0, 10).map((l) => (
          <tr key={l.ID}>
            <td className="pr-4">
              <HoverableEntityName key={l.ID} ent={l} labelSource="territory" />
            </td>
            <td className="pr-4 text-right">
              <DecimalNumber
                num={l.pop[speakingOrWriting].percentAdjusted ?? 0}
                alignFraction={false}
              />
              %
            </td>
            <td className="text-right">
              <CountOfPeople count={l.pop[speakingOrWriting].adjusted ?? 0} />
            </td>
          </tr>
        ))}
        {showableLocales.length > 10 && (
          <tr>
            <td colSpan={3} className="text-center text-muted-foreground">
              and {showableLocales.length - 10} more...
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default LanguageDrawerPopRow;
