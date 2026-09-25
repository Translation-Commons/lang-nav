import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { EntityType } from '@features/params/PageParamTypes';

import { getCensusLanguageUse } from '@entities/census/getCensusLanguageUse';
import LanguageDigitalSupportMeter from '@entities/language/digitalsupport/DigitalSupportMeter';
import { getRootLanguageFamilyForEntity } from '@entities/language/relations/LanguageFamilyUtils';
import LanguageVitalityMeter from '@entities/language/vitality/VitalityMeter';
import { VitalitySource } from '@entities/language/vitality/VitalityTypes';
import { LanguageModality } from '@entities/language/writing/LanguageModality';
import LanguageModalityIcon from '@entities/language/writing/LanguageModalityIcon';
import {
  getEntityMostImportantLanguage,
  getWritingSystemsInEntity,
} from '@entities/lib/getEntityMiscFields';
import { getContainingTerritories } from '@entities/lib/getEntityRelatedTerritories';
import LocaleFormedHereDisplay from '@entities/locale/localstatus/LocaleFormedHereDisplay';
import LocaleHistoricPresenceDisplay from '@entities/locale/localstatus/LocaleHistoricPresenceDisplay';
import LocaleIndigeneityDisplay from '@entities/locale/localstatus/LocaleIndigeneityDisplay';
import { EntityData } from '@entities/types/DataTypes';
import { EntityCLDRCoverageLevel } from '@entities/ui/CLDRCoverageInfo';
import EntityDepthDisplay from '@entities/ui/EntityDepthDisplay';
import { VariantType } from '@entities/variant/VariantTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import CommaSeparated from '@shared/ui/CommaSeparated';
import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';
import { getVariantTypeDisplay } from '@strings/VariantStrings';

import { getLanguagesRelevantToEntity } from '../filtering/filterByConnections';

import Field from './Field';
import {
  getKeyboardForEntity,
  getOrganizationsForEntity,
  getTerritoryForEntity,
  getVariantsForEntity,
} from './getEntityConnection';
import getField from './getField';

type Props = {
  ent: EntityData;
  field: Field;
};

const EntityFieldDisplay: React.FC<Props> = ({ ent, field }) => {
  const fieldValue = getField(ent, field);
  switch (field) {
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationSpeaking:
    case Field.PopulationWriting:
    case Field.PopulationOfDescendants:
    case Field.PopulationPercentInBiggestDescendantLanguage:
      if (typeof fieldValue === 'number') return <CountOfPeople count={fieldValue as number} />;
      return <>{fieldValue}</>;

    case Field.Literacy:
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.PercentOfTerritoryPopulation:
      if (typeof fieldValue === 'number') return <DecimalNumber num={fieldValue} />;
      return <>{fieldValue}</>;

    case Field.Longitude:
    case Field.Latitude:
      if (typeof fieldValue === 'number') return fieldValue.toFixed(1) + '°';
      return <>{fieldValue}</>;
    case Field.Coordinates:
      if (ent.type === EntityType.Territory || ent.type === EntityType.Language) {
        return `${ent.latitude?.toFixed(1)}°, ${ent.longitude?.toFixed(1)}°`;
      }
      return <>{fieldValue}</>;

    case Field.CountOfLanguages:
    case Field.CountOfKeyboards:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.CountOfVariants:
    case Field.Area:
      if (typeof fieldValue === 'number') return fieldValue.toLocaleString();
      return <>{fieldValue}</>;

    case Field.Name:
    case Field.Endonym:
    case Field.Code:
      return <>{fieldValue}</>; // Show the string value directly

    case Field.LanguagePrimary:
      return <HoverableEntityName ent={getEntityMostImportantLanguage(ent)} />;
    case Field.LanguageList:
      return (
        <CommaSeparated
          limit={1}
          limitText="short"
          separator={ent.type === EntityType.Language ? ' > ' : ', '}
        >
          {getLanguagesRelevantToEntity(ent).map((l) => (
            <HoverableEntityName key={l.ID} ent={l} />
          ))}
        </CommaSeparated>
      );
    case Field.LanguageFamily:
      return <HoverableEntityName ent={getRootLanguageFamilyForEntity(ent)} />;
    case Field.WritingSystem:
      return <HoverableEntityName ent={getWritingSystemsInEntity(ent)?.[0]} />;
    case Field.OutputScript:
      return <HoverableEntityName ent={getKeyboardForEntity(ent)?.outputWritingSystem} />;
    case Field.Region:
      return <HoverableEntityName ent={getTerritoryForEntity(ent)?.parentUNRegion} />;
    case Field.TerritoryPrimary:
      if (ent.type === EntityType.Territory) return <HoverableEntityName ent={ent} />;
      return <HoverableEntityName ent={getContainingTerritories(ent)?.[0]} />;
    case Field.TerritoryList:
      return (
        <CommaSeparated
          limit={2}
          limitText="short"
          separator={ent.type === EntityType.Territory ? ' > ' : ', '}
        >
          {getContainingTerritories(ent).map((l) => (
            <HoverableEntityName key={l.ID} ent={l} />
          ))}
        </CommaSeparated>
      );
    case Field.Platform:
      return getKeyboardForEntity(ent)?.platform;
    case Field.Variant:
      return <HoverableEntityName ent={getVariantsForEntity(ent)?.[0]} />;
    case Field.Organization:
      return <HoverableEntityName ent={getOrganizationsForEntity(ent)?.[0]} />;

    // Strings
    case Field.SourceForPopulation:
    case Field.SourceForLanguage:
    case Field.WritingSystemScope:
    case Field.Example:
    case Field.UnicodeVersion:
      return <>{fieldValue}</>; // Objects should be displayed using a readable name

    case Field.VitalityMetascore:
    case Field.ISOStatus:
      return <VitalityField ent={ent} field={field} />;

    case Field.Modality:
      if (ent.type === EntityType.Census) return getCensusLanguageUse(ent);
      return <LanguageModalityIcon modality={fieldValue as LanguageModality} />;

    case Field.Date:
      if (ent.type === EntityType.Census)
        return fieldValue
          ? new Date(fieldValue).toLocaleDateString(undefined, { year: 'numeric' })
          : '';
      return fieldValue ? new Date(fieldValue).toLocaleDateString() : '';

    case Field.Depth:
      return <EntityDepthDisplay ent={ent} />;

    case Field.LanguageScope:
      return typeof fieldValue === 'number' && getLanguageScopeLabel(fieldValue);
    case Field.TerritoryScope:
      return typeof fieldValue === 'number' && getTerritoryScopeLabel(fieldValue);

    case Field.Indigeneity:
      return ent.type === EntityType.Locale && <LocaleIndigeneityDisplay loc={ent} />;
    case Field.LanguageFormedHere:
      return ent.type === EntityType.Locale && <LocaleFormedHereDisplay loc={ent} />;
    case Field.HistoricPresence:
      return ent.type === EntityType.Locale && <LocaleHistoricPresenceDisplay loc={ent} />;
    case Field.VariantType:
      return fieldValue === VariantType.Dialect || fieldValue === VariantType.Orthographic
        ? getVariantTypeDisplay(fieldValue)
        : fieldValue;

    case Field.Description:
      return fieldValue ? (
        <Hoverable hoverContent={fieldValue} className="truncate ellipsis max-w-30">
          {fieldValue}
        </Hoverable>
      ) : (
        <Deemphasized>—</Deemphasized>
      );

    case Field.DigitalSupport:
      if (ent.type === EntityType.Language) return <LanguageDigitalSupportMeter lang={ent} />;
      if (ent.type === EntityType.Locale && ent.language)
        return <LanguageDigitalSupportMeter lang={ent.language} />;
      return null;

    case Field.CLDRCoverage:
      return <EntityCLDRCoverageLevel ent={ent} />;

    case Field.SourceType:
    case Field.GovernmentStatus:
    case Field.ECRMLProtection:
      return fieldValue;

    case Field.None:
      return undefined;

    default:
      enforceExhaustiveSwitch(field);
  }
};

type VitalityFieldProps = {
  ent: EntityData;
  field: Field.VitalityMetascore | Field.ISOStatus;
};

function VitalityField({ ent, field }: VitalityFieldProps) {
  if (ent.type === EntityType.Locale && ent.language)
    return <VitalityField ent={ent.language} field={field} />;
  if (ent.type !== EntityType.Language) return null;
  let src = VitalitySource.Metascore;
  if (field === Field.ISOStatus) src = VitalitySource.ISO;
  return <LanguageVitalityMeter lang={ent} src={src} />;
}

export default EntityFieldDisplay;
