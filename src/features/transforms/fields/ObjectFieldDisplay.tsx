import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { getSortField } from '@features/transforms/fields/getField';

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
  const { languageSource } = usePageParams();
  const fieldValue = getSortField(object, field, languageSource);
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
    case SortBy.CountOfTerritories:
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
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
      return <VitalityField obj={object} field={field} />;
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
    | SortBy.VitalityEthnologue2013
    | SortBy.VitalityEthnologue2025
    | SortBy.ISOStatus;
}) {
  if (obj.type !== ObjectType.Language) return null;
  let src = VitalitySource.Metascore;
  if (field === SortBy.VitalityEthnologue2013) src = VitalitySource.Eth2013;
  else if (field === SortBy.VitalityEthnologue2025) src = VitalitySource.Eth2025;
  else if (field === SortBy.ISOStatus) src = VitalitySource.ISO;
  return <LanguageVitalityMeter lang={obj} src={src} />;
}

export default ObjectFieldDisplay;
