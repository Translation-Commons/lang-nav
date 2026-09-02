import React, { useMemo } from 'react';

import DrawerActionButton from '@widgets/details/ui/DrawerActionButton';
import { DrawerDetailsField, DrawerDetailsSection } from '@widgets/details/ui/DrawerDetailsSection';
import { getEntityFullDescendants } from '@widgets/pathnav/getParentsAndDescendants';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { EntityType, PageParams, View } from '@features/params/PageParamTypes';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

import { toTitleCase } from '@shared/lib/stringUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageModalityUserLabel, getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerSummary: React.FC<Props> = ({ lang }) => {
  return (
    <DrawerDetailsSection title="At a glance">
      <LanguageDrawerPopRow lang={lang} populationFocus={PopulationFocus.Speaking} />
      <LanguageDrawerPopRow lang={lang} populationFocus={PopulationFocus.Writing} />
      <DrawerDetailsField label="Level">{getLanguageScopeLabel(lang.scope)}</DrawerDetailsField>
      <LanguageDrawerDialectsRow lang={lang} />
      {lang.modality != null ? (
        <DrawerDetailsField label="Medium of Use">
          {getModalityLabel(lang.modality)}
        </DrawerDetailsField>
      ) : null}
      <LanguageDrawerWritingSystemsRow lang={lang} />
    </DrawerDetailsSection>
  );
};

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
  const hasLocalesWithData = lang.locales?.filter(
    (l) => l.pop[speakingOrWriting].adjusted != null,
  ).length;

  return (
    <DrawerDetailsField
      label={toTitleCase(getLanguageModalityUserLabel(lang.modality, speakingOrWriting))}
      actions={
        popEstimate && hasLocalesWithData
          ? [
              <DrawerActionButton key="map" view={View.Map} baseParams={baseParams} />,
              <DrawerActionButton key="table" view={View.Table} baseParams={baseParams} />,
            ]
          : undefined
      }
    >
      <CountOfPeople count={popEstimate} />
    </DrawerDetailsField>
  );
};

const LanguageDrawerDialectsRow: React.FC<Props> = ({ lang }) => {
  const baseParams: Partial<PageParams> = {
    entType: EntityType.Language,
    entID: lang.ID, // Kept the drawer open, letting people manually close it
    populationFocus: PopulationFocus.Overall,
    languageFilter: lang.nameDisplay + ' [' + lang.ID + ']',
    languageScopes: [],
  };
  const dialects = useMemo(
    () =>
      getEntityFullDescendants(lang).filter(
        (l) =>
          l.type === EntityType.Language &&
          (l.scope === LanguageScope.Dialect || l.scope === LanguageScope.Language),
      ) as LanguageData[],
    [lang],
  );
  const childrenString = dialects.some((l) => l.scope === LanguageScope.Language)
    ? dialects.some((l) => l.scope === LanguageScope.Dialect)
      ? 'Languages and Dialects'
      : 'Languages'
    : 'Dialects';

  return (
    <DrawerDetailsField
      label={childrenString}
      actions={
        dialects.length > 0 && [
          <DrawerActionButton key="hierarchy" view={View.Hierarchy} baseParams={baseParams} />,
          <DrawerActionButton key="map" view={View.Map} baseParams={baseParams} />,
          <DrawerActionButton key="table" view={View.Table} baseParams={baseParams} />,
        ]
      }
    >
      {dialects.length > 0 ? dialects.length : <Deemphasized>No dialects</Deemphasized>}
    </DrawerDetailsField>
  );
};

const LanguageDrawerWritingSystemsRow: React.FC<Props> = ({ lang }) => {
  const writingSystems = Object.values(lang.writingSystems);

  if (writingSystems.length === 0) return null;

  return (
    <DrawerDetailsField
      label="Writing Systems"
      actions={
        <DrawerActionButton
          key="table"
          view={View.Table}
          baseParams={{
            entType: EntityType.WritingSystem,
            entID: lang.ID,
            languageFilter: lang.nameDisplay + ' [' + lang.ID + ']',
            languageScopes: [],
          }}
        />
      }
    >
      <HoverableEntityName ent={writingSystems[0]} />
      {writingSystems.length > 1 ? ` + ${writingSystems.length - 1} more` : ''}
    </DrawerDetailsField>
  );
};

export default LanguageDrawerSummary;
