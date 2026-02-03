import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import { getSortField } from '@features/transforms/fields/getField';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageModalityIcon } from '@entities/language/LanguageModalityDisplay';
import LanguageVitalityMeter from '@entities/language/vitality/VitalityMeter';
import { VitalitySource } from '@entities/language/vitality/VitalityTypes';
import { ObjectData } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';

import { ColorBy } from '../coloring/ColorTypes';
import { SortBy } from '../sorting/SortTypes';

type Props = {
  object: ObjectData;
  field: ColorBy;
};

const ObjectFieldDisplay: React.FC<Props> = ({ object, field }) => {
  const fieldValue = getSortField(object, field);
  switch (field) {
    case SortBy.Population:
    case SortBy.PopulationDirectlySourced:
    case SortBy.PopulationOfDescendants:
    case SortBy.PopulationPercentInBiggestDescendantLanguage:
      if (typeof fieldValue === 'number') return <CountOfPeople count={fieldValue as number} />;
      return <>{fieldValue}</>;
    case SortBy.Literacy:
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.Longitude:
    case SortBy.Latitude:
      if (typeof fieldValue === 'number') return <DecimalNumber num={fieldValue} />;
      return <>{fieldValue}</>;

    case SortBy.CountOfLanguages:
    case SortBy.CountOfWritingSystems:
    case SortBy.CountOfCountries:
    case SortBy.CountOfChildTerritories:
    case SortBy.CountOfCensuses:
    case SortBy.Area:
      if (typeof fieldValue === 'number') return fieldValue.toLocaleString();
      return <>{fieldValue}</>;

    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
    case SortBy.Language:
    case SortBy.WritingSystem:
    case SortBy.Territory:
      return <>{fieldValue}</>;

    case SortBy.VitalityMetascore:
    case SortBy.ISOStatus:
    case SortBy.VitalityEthnologueFine:
    case SortBy.VitalityEthnologueCoarse:
      return <VitalityField obj={object} field={field} />;

    case SortBy.Modality:
      return <LanguageModalityIcon modality={fieldValue as LanguageModality} />;
  }
  return <>{fieldValue}</>;
};

function VitalityField({
  obj,
  field,
}: {
  obj: ObjectData;
  field:
    | SortBy.VitalityMetascore
    | SortBy.VitalityEthnologueFine
    | SortBy.VitalityEthnologueCoarse
    | SortBy.ISOStatus;
}) {
  if (obj.type !== ObjectType.Language) return null;
  let src = VitalitySource.Metascore;
  if (field === SortBy.VitalityEthnologueFine) src = VitalitySource.Eth2012;
  else if (field === SortBy.VitalityEthnologueCoarse) src = VitalitySource.Eth2025;
  else if (field === SortBy.ISOStatus) src = VitalitySource.ISO;
  return <LanguageVitalityMeter lang={obj} src={src} />;
}

export default ObjectFieldDisplay;
