import Field from '../fields/Field';

import { AxisScale } from './AxisScale';

function getDefaultAxisScale(field: Field): AxisScale {
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
      return AxisScale.Logarithmic;
    default:
      return AxisScale.Linear;
  }
}

export default getDefaultAxisScale;
