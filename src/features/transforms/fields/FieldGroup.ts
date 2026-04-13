import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import Field from './Field';

export enum FieldGroup {
  Identity,
  Status,
  Relation,
  Quantity,
  Other,
}

export function getFieldGroup(field: Field): FieldGroup {
  switch (field) {
    case Field.Code:
      return FieldGroup.Identity; // Code
    case Field.Name:
    case Field.Endonym:
      return FieldGroup.Identity; // Name
    case Field.LanguageScope:
    case Field.WritingSystemScope:
    case Field.TerritoryScope:
    case Field.VariantType:
    case Field.SourceType:
      return FieldGroup.Identity; // Scope

    case Field.Modality: // Status
      return FieldGroup.Status; // Status
    case Field.Indigeneity:
    case Field.HistoricPresence:
    case Field.LanguageFormedHere:
    case Field.GovernmentStatus:
    case Field.ECRMLProtection:
      return FieldGroup.Status; // Status - Indigeneity
    case Field.DigitalSupport:
    case Field.CLDRCoverage:
    case Field.UnicodeVersion:
      return FieldGroup.Status; // Status - Digital Support
    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
      return FieldGroup.Status; // Vitality

    case Field.Language:
    case Field.LanguageFamily:
    case Field.WritingSystem:
    case Field.OutputScript:
    case Field.Territory:
    case Field.Region:
    case Field.Variant:
    case Field.Platform:
    case Field.SourceForLanguage:
    case Field.SourceForPopulation:
      return FieldGroup.Relation;
    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfChildTerritories:
    case Field.CountOfCountries:
    case Field.CountOfCensuses:
    case Field.CountOfVariants:
      return FieldGroup.Relation; // Count

    case Field.Area:
    case Field.Depth:
    case Field.Coordinates:
    case Field.Latitude:
    case Field.Longitude:
    case Field.Literacy:
      return FieldGroup.Quantity;
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationOfDescendants:
      return FieldGroup.Quantity; // Population
    case Field.PercentOfTerritoryPopulation:
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.PopulationPercentInBiggestDescendantLanguage:
      return FieldGroup.Quantity; // Population Percent

    case Field.Date:
    case Field.None:
    case Field.Description:
    case Field.Example:
      return FieldGroup.Other;
    default:
      enforceExhaustiveSwitch(field);
  }
}

export function getFieldGroups(): FieldGroup[] {
  return Object.values(FieldGroup).filter((value) => typeof value === 'number');
}

export function getFieldsInGroup(fieldGroup: FieldGroup): Field[] {
  return Object.values(Field).filter((field) => getFieldGroup(field) === fieldGroup);
}

export function getFieldGroupLabel(fieldGroup: FieldGroup): string {
  return FieldGroup[fieldGroup];
}
