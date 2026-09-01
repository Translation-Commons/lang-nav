import { ListTreeIcon, MapIcon, TableIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import { DrawerDetailsField, DrawerDetailsSection } from '@widgets/details/ui/DrawerDetailsSection';
import { getEntityFullDescendants } from '@widgets/pathnav/getParentsAndDescendants';

import { EntityType, PageParams, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageData, LanguageField, LanguageScope } from '@entities/language/LanguageTypes';
import PopulationFocus from '@entities/types/PopulationFocus';
import { EntityCLDRCoverageLevel } from '@entities/ui/CLDRCoverageInfo';
import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { toTitleCase } from '@shared/lib/stringUtils';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';
import ExternalLink from '@shared/ui/ExternalLink';
import { HoverCard, HoverCardTrigger } from '@shared/ui/hover-card';

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
  const otherNames = lang.names.filter(
    (name) => ![lang.nameDisplay, lang.nameEndonym, lang.nameCanonical].includes(name),
  );

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
              <HoverCard>
                <HoverCardTrigger>⚠️</HoverCardTrigger>
                <LanguageRetirementReason lang={lang} />
              </HoverCard>
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
        {otherNames.length > 0 && (
          <DrawerDetailsField label="Other names">{otherNames.join(', ')}</DrawerDetailsField>
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
  const { updatePageParams } = usePageParams();
  const baseParams: Partial<PageParams> = {
    entType: EntityType.Locale,
    populationFocus: populationFocus,
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

  return (
    <DrawerDetailsField
      label={toTitleCase(getLanguageModalityUserLabel(lang.modality, speakingOrWriting))}
      actions={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updatePageParams({ view: View.Map, ...baseParams })}
          >
            <MapIcon />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updatePageParams({ view: View.Table, ...baseParams })}
          >
            <TableIcon />
          </Button>
        </>
      }
    >
      <CountOfPeople count={lang.pop[speakingOrWriting].estimate} />
    </DrawerDetailsField>
  );
};

const LanguageDrawerDialectsRow: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { updatePageParams } = usePageParams();
  const baseParams: Partial<PageParams> = {
    entType: EntityType.Language,
    populationFocus: PopulationFocus.Overall,
    languageFilter: lang.nameDisplay + ' [' + lang.ID + ']',
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
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updatePageParams({ view: View.Hierarchy, ...baseParams })}
          >
            <ListTreeIcon />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updatePageParams({ view: View.Map, ...baseParams })}
          >
            <MapIcon />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updatePageParams({ view: View.Table, ...baseParams })}
          >
            <TableIcon />
          </Button>
        </>
      }
    >
      {dialects.length > 0 ? dialects.length : <Deemphasized>No dialects</Deemphasized>}
    </DrawerDetailsField>
  );
};

export default LanguageDrawerContents;
