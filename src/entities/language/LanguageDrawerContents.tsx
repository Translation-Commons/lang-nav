import { ListTreeIcon, MapIcon, TableIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import { DrawerDetailsField, DrawerDetailsSection } from '@widgets/details/ui/DrawerDetailsSection';
import { getEntityFullDescendants } from '@widgets/pathnav/getParentsAndDescendants';

import { EntityType, PageParams, View } from '@features/params/PageParamTypes';
import usePageParamNavigation from '@features/params/usePageParamNavigation';

import { LanguageData, LanguageField, LanguageScope } from '@entities/language/LanguageTypes';
import PopulationFocus from '@entities/types/PopulationFocus';
import { EntityCLDRCoverageLevel } from '@entities/ui/CLDRCoverageInfo';
import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { toTitleCase } from '@shared/lib/stringUtils';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import ContextIcon from '@shared/ui/ContextIcon';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';
import ExternalLink from '@shared/ui/ExternalLink';

import { getDigitalSupportDimensionLabel } from '@strings/DigitalSupportStrings';
import { getLanguageModalityUserLabel, getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import LanguageDigitalSupportMeter from './digitalsupport/DigitalSupportMeter';
import { DigitalSupportDimension } from './digitalsupport/DigitalSupportTypes';
import LanguageRetirementReason from './LanguageRetirementReason';
import { getLanguageISOStatusLabel } from './vitality/VitalityStrings';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerContents: React.FC<Props> = ({ lang }) => {
  const { ISO } = lang;
  const digitalSupport = lang.digitalSupportScore;

  return (
    <div className="flex flex-col gap-3">
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
      </DrawerDetailsSection>

      <DrawerDetailsSection title="Systems">
        <DrawerDetailsField label="ISO status">
          {ISO.status || ISO.scope === LanguageScope.Family ? (
            ISO.status ? (
              getLanguageISOStatusLabel(ISO.status)
            ) : (
              getLanguageScopeLabel(ISO.scope)
            )
          ) : (
            <Deemphasized>not in ISO</Deemphasized>
          )}
          {ISO.scope && ISO.scope !== lang.scope && <Badge>{ISO.scope}</Badge>}
        </DrawerDetailsField>
        {ISO.code && (
          <DrawerDetailsField
            label="ISO code"
            actions={
              <ExternalLink href={`https://iso639-3.sil.org/code/${ISO.code}`}> </ExternalLink>
            }
          >
            {ISO.code}
            {ISO.code6391 && ` | ${ISO.code6391}`}
            {lang.warnings[LanguageField.isoCode] && (
              <ContextIcon severity="warning">
                <LanguageRetirementReason lang={lang} />
              </ContextIcon>
            )}
          </DrawerDetailsField>
        )}
        {lang.Glottolog.code && (
          <DrawerDetailsField
            label="Glottocode"
            actions={
              <ExternalLink
                href={`https://glottolog.org/resource/languoid/id/${lang.Glottolog.code}`}
              >
                {' '}
              </ExternalLink>
            }
          >
            {lang.Glottolog.code}
          </DrawerDetailsField>
        )}
        {lang.CLDR.code && (
          <DrawerDetailsField label="CLDR">
            {lang.CLDR.code != ISO.code && lang.CLDR.code}
            <CLDRWarningNotes ent={lang} /> <EntityCLDRCoverageLevel ent={lang} />
          </DrawerDetailsField>
        )}
      </DrawerDetailsSection>

      {lang.digitalSupportScore && (
        <DrawerDetailsSection title="Digital support">
          {Object.values(DigitalSupportDimension).map((dimension) => (
            <DrawerDetailsField key={dimension} label={getDigitalSupportDimensionLabel(dimension)}>
              <div className="flex flex-row gap-1 items-center">
                {digitalSupport?.[dimension] == null ? (
                  <Deemphasized>No data</Deemphasized>
                ) : (
                  `${numberToSigFigs(digitalSupport?.[dimension], 2)}/10`
                )}
                <LanguageDigitalSupportMeter lang={lang} dim={dimension} />
              </div>
            </DrawerDetailsField>
          ))}
        </DrawerDetailsSection>
      )}
    </div>
  );
};

type LanguageDrawerPopRowProps = {
  lang: LanguageData;
  populationFocus: PopulationFocus;
};

const LanguageDrawerPopRow: React.FC<LanguageDrawerPopRowProps> = ({ lang, populationFocus }) => {
  const baseParams: Partial<PageParams> = {
    entType: EntityType.Locale,
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

const LanguageDrawerDialectsRow: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const baseParams: Partial<PageParams> = {
    entType: EntityType.Language,
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

const DrawerActionButton: React.FC<{ view: View; baseParams: Partial<PageParams> }> = ({
  view,
  baseParams,
}) => {
  const updatePage = usePageParamNavigation({});
  return (
    <Button variant="ghost" size="sm" onClick={() => updatePage({ view, ...baseParams })}>
      {view === View.Hierarchy && <ListTreeIcon />}
      {view === View.Map && <MapIcon />}
      {view === View.Table && <TableIcon />}
    </Button>
  );
};

export default LanguageDrawerContents;
