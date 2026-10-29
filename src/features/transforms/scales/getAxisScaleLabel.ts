import { AxisScale } from './AxisScale';

function getAxisScaleLabel(scale: AxisScale, length: 'short' | 'long' = 'long') {
  switch (scale) {
    case AxisScale.Default:
      return 'Default';
    case AxisScale.Logarithmic:
      return length === 'long' ? 'Logarithmic' : 'Log';
    case AxisScale.SquareRooted:
      return length === 'long' ? 'Square Rooted' : 'Sqrt';
    case AxisScale.Linear:
      return length === 'long' ? 'Linear' : 'Lin';
  }
}

export default getAxisScaleLabel;
