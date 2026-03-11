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
    case Field.LanguageFormedHere:
    case Field.HistoricPresence:
      // Low values are blue, high values are orange
      return ColorGradient.DivergingBlueToOrange;

    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
    case Field.Literacy:
      // "Bad" values are red, "Good" values are green
      return ColorGradient.StopLightRedToGreen;

    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.Depth:
    case Field.LanguageScope:
    case Field.TerritoryScope:
      // Preferred color schema for ordinals
      // Low values are light blue, high values are dark blue
      return ColorGradient.SequentialBlue;

    case Field.Longitude:
    case Field.Latitude:
    case Field.Name:
    case Field.Endonym:
      // Continuous spectrum
      return ColorGradient.OklabRainbowBlueToRed;

    case Field.Code:
      // Since the Codes are regularly spaced in the alphabet it works to color maps with scattered values
      return ColorGradient.ScatteredOklab;
    case Field.Language:
    case Field.WritingSystem:
    case Field.Territory:
    case Field.Platform:
    case Field.OutputScript:
    case Field.VariantTag:
      // These values are the names of related objects, not ideal for coloring with a gradient, but
      // since they are categorical values with no intrinsic order, a scattered gradient is more
      // appropriate than a sequential or diverging one.
      return ColorGradient.ScatteredOklab;

    default:
      enforceExhaustiveSwitch(colorBy);
  }
}

export default getColorGradientForField;
