import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageModalityIcon } from '@entities/language/LanguageModalityDisplay';
import LanguageVitalityMeter from '@entities/language/vitality/VitalityMeter';
import { VitalitySource } from '@entities/language/vitality/VitalityTypes';
import { ObjectData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';

import Field from './Field';
import getField from './getField';

type Props = {
  object: ObjectData;
  field: Field;
};

const ObjectFieldDisplay: React.FC<Props> = ({ object, field }) => {
  const fieldValue = getField(object, field);
  switch (field) {
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationOfDescendants:
    case Field.PopulationPercentInBiggestDescendantLanguage:
      if (typeof fieldValue === 'number') return <CountOfPeople count={fieldValue as number} />;
      return <>{fieldValue}</>;

    case Field.Literacy:
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.PercentOfTerritoryPopulation:
    case Field.Longitude:
    case Field.Latitude:
      if (typeof fieldValue === 'number') return <DecimalNumber num={fieldValue} />;
      return <>{fieldValue}</>;

    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.Area:
      if (typeof fieldValue === 'number') return fieldValue.toLocaleString();
      return <>{fieldValue}</>;

    case Field.Name:
    case Field.Endonym:
    case Field.Code:
    case Field.Language:
    case Field.WritingSystem:
    case Field.Territory:
      return <>{fieldValue}</>;

    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
      return <VitalityField obj={object} field={field} />;

    case Field.Modality:
      return <LanguageModalityIcon modality={fieldValue as LanguageModality} />;

    case Field.None:
      return undefined;

    case Field.Date:
      if (object.type === ObjectType.Census)
        return fieldValue
          ? new Date(fieldValue).toLocaleDateString(undefined, { year: 'numeric' })
          : '';
      return fieldValue ? new Date(fieldValue).toLocaleDateString() : '';

    default:
      enforceExhaustiveSwitch(field);
  }
};

function VitalityField({
  obj,
  field,
}: {
  obj: ObjectData;
  field:
    | Field.VitalityMetascore
    | Field.VitalityEthnologueFine
    | Field.VitalityEthnologueCoarse
    | Field.ISOStatus;
}) {
  if (obj.type !== ObjectType.Language) return null;
  let src = VitalitySource.Metascore;
  if (field === Field.VitalityEthnologueFine) src = VitalitySource.Eth2012;
  else if (field === Field.VitalityEthnologueCoarse) src = VitalitySource.Eth2025;
  else if (field === Field.ISOStatus) src = VitalitySource.ISO;
  return <LanguageVitalityMeter lang={obj} src={src} />;
}

export default ObjectFieldDisplay;
