import {
  ActivityIcon,
  BabyIcon,
  BlocksIcon,
  BookOpenCheckIcon,
  BracketsIcon,
  BuildingIcon,
  CalendarIcon,
  CaseSensitiveIcon,
  CircleDashedIcon,
  ClockIcon,
  EarthIcon,
  FileCodeIcon,
  FileDigitIcon,
  HashIcon,
  LandmarkIcon,
  LanguagesIcon,
  LocateFixedIcon,
  LucideIcon,
  MapPinHouseIcon,
  MapPinIcon,
  MapPinnedIcon,
  MessageCircleIcon,
  MonitorCheckIcon,
  MonitorSmartphoneIcon,
  NetworkIcon,
  NotebookPenIcon,
  NotebookTextIcon,
  PencilLineIcon,
  PercentIcon,
  RulerDimensionLineIcon,
  RulerIcon,
  ScrollTextIcon,
  TextIcon,
  UserCheckIcon,
  UsersIcon,
  WholeWordIcon,
} from 'lucide-react';
import React from 'react';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

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
    case Field.Description:
      return TextIcon;

    case Field.LanguageScope:
      return NetworkIcon;
    case Field.WritingSystemScope:
    case Field.TerritoryScope:
    case Field.VariantType:
      return BlocksIcon;
    case Field.SourceType:
      return BuildingIcon;

    // Status
    case Field.Modality:
      return MessageCircleIcon;

    case Field.DigitalSupport:
      return MonitorCheckIcon;
    case Field.CLDRCoverage:
      return FileCodeIcon;
    case Field.UnicodeVersion:
      return FileDigitIcon;

    case Field.Indigeneity:
    case Field.LanguageFormedHere:
      return MapPinHouseIcon;
    case Field.HistoricPresence:
      return ClockIcon;
    case Field.GovernmentStatus:
    case Field.ECRMLProtection:
      return LandmarkIcon;

    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
      return ActivityIcon;

    // Relation
    case Field.Language:
      return LanguagesIcon;
    case Field.LanguageFamily:
      return NetworkIcon;
    case Field.WritingSystem:
      return NotebookPenIcon;
    case Field.OutputScript:
      return NotebookTextIcon;
    case Field.Region:
      return EarthIcon;
    case Field.Territory:
      return MapPinnedIcon;
    case Field.Platform:
      return MonitorSmartphoneIcon;
    case Field.Variant:
      return MapPinIcon;
    case Field.SourceForLanguage:
      return ScrollTextIcon;
    case Field.SourceForPopulation:
      return BracketsIcon;

    case Field.CountOfLanguages:
    case Field.CountOfKeyboards:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.CountOfVariants:
      return HashIcon;

    // Quantity
    case Field.Coordinates:
    case Field.Latitude:
    case Field.Longitude:
      return LocateFixedIcon;
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

    // Other
    case Field.Date:
      return CalendarIcon;
    case Field.Example:
      return PencilLineIcon;
    case Field.None:
      return CircleDashedIcon;

    default:
      enforceExhaustiveSwitch(field);
  }
}

const FieldIcon: React.FC<{ field: Field }> = ({ field }) => {
  const Icon = getFieldIcon(field);
  return <Icon size="1em" display="block" />;
};

export default FieldIcon;
