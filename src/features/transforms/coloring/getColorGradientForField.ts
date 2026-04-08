import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import Field from '../fields/Field';

import { ColorGradient } from './ColorTypes';

function getColorGradientForField(colorBy: Field): ColorGradient {
  switch (colorBy) {
    case Field.None:
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationOfDescendants:
    case Field.PopulationPercentInBiggestDescendantLanguage:
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.PercentOfTerritoryPopulation:
    case Field.Date:
    case Field.Area:
    case Field.Modality:
      // Low values are blue, high values are orange
      return ColorGradient.DivergingBlueToOrange;

    case Field.DigitalSupport:
    case Field.CLDRCoverage:
    case Field.UnicodeVersion:
    case Field.Literacy:
    case Field.Indigeneity:
    case Field.LanguageFormedHere:
    case Field.HistoricPresence:
    case Field.GovernmentStatus:
    case Field.ECRMLProtection:
    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
      // "Bad" values are red, "Good" values are green
      return ColorGradient.StopLightRedToGreen;

    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.CountOfVariants:
    case Field.Depth:
    case Field.LanguageScope:
    case Field.WritingSystemScope:
    case Field.TerritoryScope:
    case Field.VariantType:
      // Preferred color schema for ordinals
      // Low values are light blue, high values are dark blue
      return ColorGradient.SequentialBlue;

    case Field.Coordinates:
    case Field.Longitude:
    case Field.Latitude:
    case Field.Name:
    case Field.Endonym:
    case Field.SourceType:
    case Field.Description:
    case Field.Example:
      // Continuous spectrum
      return ColorGradient.OklabRainbowBlueToRed;

    case Field.Code:
      // Since the Codes are regularly spaced in the alphabet it works to color maps with scattered values
      return ColorGradient.ScatteredOklab;
    case Field.Language:
    case Field.LanguageFamily:
    case Field.WritingSystem:
    case Field.OutputScript:
    case Field.Region:
    case Field.Territory:
    case Field.Variant:
    case Field.Platform:
    case Field.SourceForLanguage:
    case Field.SourceForPopulation:
      // These values are the names of related objects, not ideal for coloring with a gradient, but
      // since they are categorical values with no intrinsic order, a scattered gradient is more
      // appropriate than a sequential or diverging one.
      return ColorGradient.ScatteredOklab;

    default:
      enforceExhaustiveSwitch(colorBy);
  }
}

export default getColorGradientForField;
