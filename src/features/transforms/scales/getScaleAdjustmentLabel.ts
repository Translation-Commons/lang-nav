import { ScaleAdjustment } from './ScaleAdjustment';

function getScaleAdjustmentLabel(scale: ScaleAdjustment, length: 'short' | 'long' = 'long') {
  switch (scale) {
    case ScaleAdjustment.Default:
      return 'Default';
    case ScaleAdjustment.Logarthmic:
      return length === 'long' ? 'Logarithmic' : 'Log';
    case ScaleAdjustment.SquareRooted:
      return length === 'long' ? 'Square Rooted' : 'Sqrt';
    case ScaleAdjustment.Linear:
      return length === 'long' ? 'Linear' : 'Lin';
  }
}

export default getScaleAdjustmentLabel;
