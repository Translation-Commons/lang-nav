import { ColorGradient } from './ColorTypes';

/**
 * Return a function that maps a normalized value (0 to 1) to a color string, based on the selected color gradient.
 */
export function getColorGradientFunction(colorGradient: ColorGradient): (value: number) => string {
  switch (colorGradient) {
    case ColorGradient.DivergingBlueToOrange:
      //   hsl(240, 90%, 60%) -> hsl(135, 90%, 100%) -> hsl(30, 90%, 60%)
      return (value: number) => {
        return `hsl(${value < 0.5 ? 240 : 30}, 90%, ${100 - Math.abs(value - 0.5) * 80}%)`;
      };
    case ColorGradient.DivergingRedToGreen:
      // hsl(0, 80%, 60%) ->  hsl(0, 80%, 100%) ->  hsl(120, 80%, 60%)
      return (value: number) => {
        return `hsl(${value < 0.5 ? 0 : 120}, 80%, ${100 - Math.abs(value - 0.5) * 80}%)`;
      };
    case ColorGradient.StopLightRedToGreen:
      // hsl(0, 80%, 60%) ->  hsl(60, 80%, 50%) ->  hsl(120, 80%, 60%)
      return (value: number) => {
        return `hsl(${value * 120}, 80%, ${80 - Math.abs(value - 0.5) * 40}%)`;
      };
    case ColorGradient.HueRainbowBlueToRed:
      // hsl(240, 80%, 60%) -> hsl(180, 80%, 60%) -> hsl(120, 80%, 60%) -> hsl(60, 80%, 60%) -> hsl(0, 80%, 60%)
      return (value: number) => {
        return `hsl(${240 - value * 240}, 80%, 60%)`;
      };
    case ColorGradient.SequentialBlue:
      // Same blue as the primary button color
      // hsl(211, 80%, 100%) -> hsl(211, 80%, 75%) -> hsl(211, 80%, 50%)
      return (value: number) => {
        return `hsl(211, 80%, ${100 - value * 50}%)`;
      };
    case ColorGradient.SequentialOrange:
      // hsl(30, 80%, 100%) -> hsl(30, 80%, 75%) -> hsl(30, 80%, 50%)
      return (value: number) => {
        return `hsl(30, 80%, ${100 - value * 50}%)`;
      };

    // Inverses
    case ColorGradient.DivergingOrangeToBlue:
      return (value: number) =>
        getColorGradientFunction(ColorGradient.DivergingBlueToOrange)(1 - value);
    case ColorGradient.DivergingGreenToRed:
      return (value: number) =>
        getColorGradientFunction(ColorGradient.DivergingRedToGreen)(1 - value);
    case ColorGradient.StopLightGreenToRed:
      return (value: number) =>
        getColorGradientFunction(ColorGradient.StopLightRedToGreen)(1 - value);
    case ColorGradient.HueRainbowRedToBlue:
      return (value: number) =>
        getColorGradientFunction(ColorGradient.HueRainbowBlueToRed)(1 - value);
    case ColorGradient.SequentialBlueReverse:
      return (value: number) => getColorGradientFunction(ColorGradient.SequentialBlue)(1 - value);
    case ColorGradient.SequentialOrangeReverse:
      return (value: number) => getColorGradientFunction(ColorGradient.SequentialOrange)(1 - value);
  }
}
