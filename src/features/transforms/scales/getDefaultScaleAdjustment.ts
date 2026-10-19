import Field from '../fields/Field';

import { ScaleAdjustment } from './ScaleAdjustment';

function getDefaultScaleAdjustment(field: Field): ScaleAdjustment {
  switch (field) {
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationSpeaking:
    case Field.PopulationWriting:
    case Field.PopulationOfDescendants:
    case Field.PopulationPercentInBiggestDescendantLanguage:
    case Field.CountOfLanguages:
    case Field.CountOfKeyboards:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.ISOStatus: // Because it's values are actually 0, 1, 3, 9. Note that there is also a -1 value for "special codes" -- that's just left out
    case Field.Area:
      return ScaleAdjustment.Logarthmic;
    default:
      return ScaleAdjustment.Linear;
  }
}

export default getDefaultScaleAdjustment;
