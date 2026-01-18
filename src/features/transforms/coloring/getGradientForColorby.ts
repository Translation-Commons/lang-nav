import { SortBy } from '../sorting/SortTypes';

import { ColorBy, ColorGradient } from './ColorTypes';

function getGradientForColorBy(colorBy: ColorBy): ColorGradient {
  if (colorBy === 'None') return ColorGradient.DivergingBlueToOrange;

  switch (colorBy) {
    case SortBy.Population:
    case SortBy.PopulationDirectlySourced:
    case SortBy.PopulationOfDescendants:
    case SortBy.PopulationPercentInBiggestDescendantLanguage:
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.Date:
    case SortBy.Area:
      // Low values are blue, high values are orange
      return ColorGradient.DivergingBlueToOrange;
    case SortBy.VitalityMetascore:
    case SortBy.ISOStatus:
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
    case SortBy.Literacy:
      // "Bad" values are red, "Good" values are green
      return ColorGradient.StopLightRedToGreen;
    case SortBy.Longitude:
    case SortBy.Latitude:
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
    case SortBy.Language:
    case SortBy.WritingSystem:
    case SortBy.Territory:
      // More of a spectrum rather than directional
      return ColorGradient.HueRainbowBlueToRed;

    case SortBy.CountOfLanguages:
    case SortBy.CountOfCountries:
    case SortBy.CountOfChildTerritories:
    case SortBy.CountOfCensuses:
      return ColorGradient.SequentialBlue;
  }
}

export default getGradientForColorBy;
