import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import Field from '../fields/Field';

import { ColorGradient } from './ColorTypes';

function getGradientForColorBy(colorBy: Field): ColorGradient {
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
    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
    case Field.Literacy:
      // "Bad" values are red, "Good" values are green
      return ColorGradient.StopLightRedToGreen;
    case Field.Longitude:
    case Field.Latitude:
    case Field.Name:
    case Field.Endonym:
    case Field.Code:
    case Field.Language:
    case Field.WritingSystem:
    case Field.Territory:
      // More of a spectrum rather than directional
      return ColorGradient.HueRainbowBlueToRed;

    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
      return ColorGradient.SequentialBlue;

    default:
      enforceExhaustiveSwitch(colorBy);
  }
}

export default getGradientForColorBy;
