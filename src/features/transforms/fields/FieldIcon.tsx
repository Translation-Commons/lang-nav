import {
  ActivityIcon,
  AxeIcon,
  BabyIcon,
  BookOpenCheckIcon,
  CalendarIcon,
  CaseSensitiveIcon,
  CircleDashedIcon,
  ClockIcon,
  HashIcon,
  LanguagesIcon,
  LocateFixedIcon,
  LucideIcon,
  MapPinHouseIcon,
  MapPinnedIcon,
  MonitorSmartphoneIcon,
  NetworkIcon,
  NotebookPenIcon,
  PenLineIcon,
  PercentIcon,
  RulerDimensionLineIcon,
  RulerIcon,
  SpeechIcon,
  UserCheckIcon,
  UsersIcon,
  WholeWordIcon,
} from 'lucide-react';
import React from 'react';

import Field from './Field';

export function getFieldIcon(field: Field): LucideIcon {
  switch (field) {
    // Identity
    case Field.Code:
      return WholeWordIcon;
    case Field.Name:
      return CaseSensitiveIcon;
    case Field.Endonym:
      return LanguagesIcon;
    case Field.LanguageScope:
    case Field.TerritoryScope:
      return NetworkIcon;

    // Status
    case Field.Modality:
      return SpeechIcon;
    case Field.LanguageFormedHere:
      return MapPinHouseIcon;
    case Field.HistoricPresence:
      return ClockIcon;
    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
      return ActivityIcon;

    // Relation
    case Field.Language:
      return LanguagesIcon;
    case Field.WritingSystem:
    case Field.OutputScript:
      return NotebookPenIcon;
    case Field.Territory:
      return MapPinnedIcon;
    case Field.Platform:
      return MonitorSmartphoneIcon;
    case Field.VariantTag:
      return PenLineIcon;
    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
      return HashIcon;

    // Quantity
    case Field.Latitude:
    case Field.Longitude:
      return LocateFixedIcon;
    case Field.Date:
      return CalendarIcon;
    case Field.Area:
      return RulerDimensionLineIcon;
    case Field.Depth:
      return RulerIcon;
    case Field.Literacy:
      return BookOpenCheckIcon;

    // Quantity - Population Percent
    case Field.Population:
      return UsersIcon;
    case Field.PopulationDirectlySourced:
      return UserCheckIcon;
    case Field.PopulationOfDescendants:
      return BabyIcon;
    case Field.PercentOfTerritoryPopulation:
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.PopulationPercentInBiggestDescendantLanguage:
      return PercentIcon;

    case Field.None:
      return CircleDashedIcon;

    default:
      return AxeIcon;
  }
}

const FieldIcon: React.FC<{ field: Field }> = ({ field }) => {
  const Icon = getFieldIcon(field);
  return <Icon size="1em" display="block" />;
};

export default FieldIcon;
