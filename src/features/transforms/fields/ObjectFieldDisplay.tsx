import React from 'react';

import { EntityType } from '@features/params/PageParamTypes';

import { LanguageModality } from '@entities/language/LanguageModality';
import LanguageModalityIcon from '@entities/language/LanguageModalityIcon';
import LanguageVitalityMeter from '@entities/language/vitality/VitalityMeter';
import { VitalitySource } from '@entities/language/vitality/VitalityTypes';
import LocaleFormedHereDisplay from '@entities/locale/localstatus/LocaleFormedHereDisplay';
import LocaleHistoricPresenceDisplay from '@entities/locale/localstatus/LocaleHistoricPresenceDisplay';
import LocaleIndigeneityDisplay from '@entities/locale/localstatus/LocaleIndigeneityDisplay';
import { EntityData } from '@entities/types/DataTypes';
import ObjectDepthDisplay from '@entities/ui/ObjectDepthDisplay';
import { VariantType } from '@entities/variant/VariantTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';
import { getVariantTypeDisplay } from '@strings/VariantStrings';

import Field from './Field';
import getField from './getField';

type Props = {
  ent: EntityData;
  field: Field;
};

const ObjectFieldDisplay: React.FC<Props> = ({ ent, field }) => {
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
      if (typeof fieldValue === 'number') return fieldValue.toFixed(1);
      return <>{fieldValue}</>;
    case Field.Coordinates:
      if (ent.type === EntityType.Territory || ent.type === EntityType.Language) {
        return `${ent.latitude?.toFixed(1)}, ${ent.longitude?.toFixed(1)}`;
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

    case Field.Language:
    case Field.LanguageFamily:
    case Field.WritingSystem:
    case Field.Region:
    case Field.Territory:
    case Field.Platform:
    case Field.OutputScript:
    case Field.Variant:
    case Field.SourceForLanguage:
    case Field.SourceForPopulation:
      return <>{fieldValue}</>; // Objects should be displayed using a readable name

    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
      return <VitalityField ent={ent} field={field} />;

    case Field.Modality:
      return <LanguageModalityIcon modality={fieldValue as LanguageModality} />;

    case Field.Date:
      if (ent.type === EntityType.Census)
        return fieldValue
          ? new Date(fieldValue).toLocaleDateString(undefined, { year: 'numeric' })
          : '';
      return fieldValue ? new Date(fieldValue).toLocaleDateString() : '';

    case Field.Depth:
      return <ObjectDepthDisplay ent={ent} />;

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
    case Field.Example:
    case Field.UnicodeVersion:
    case Field.CLDRCoverage:
    case Field.DigitalSupport:
    case Field.SourceType:
    case Field.WritingSystemScope:
    case Field.GovernmentStatus:
    case Field.ECRMLProtection:
    case Field.None:
      return undefined;

    default:
      enforceExhaustiveSwitch(field);
  }
};

type VitalityFieldProps = {
  ent: EntityData;
  field:
    | Field.VitalityMetascore
    | Field.VitalityEthnologueFine
    | Field.VitalityEthnologueCoarse
    | Field.ISOStatus;
};

function VitalityField({ ent, field }: VitalityFieldProps) {
  if (ent.type !== EntityType.Language) return null;
  let src = VitalitySource.Metascore;
  if (field === Field.VitalityEthnologueFine) src = VitalitySource.Eth2012;
  else if (field === Field.VitalityEthnologueCoarse) src = VitalitySource.Eth2025;
  else if (field === Field.ISOStatus) src = VitalitySource.ISO;
  return <LanguageVitalityMeter lang={ent} src={src} />;
}

export default ObjectFieldDisplay;
