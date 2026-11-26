import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

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
    case ColorGradient.StopLightSunrise:
      return (value: number) => {
        if (value < 0.2) {
          // dark gray to red
          const localValue = value / 0.2;
          return `hsl(0, ${localValue * 95}%, ${localValue * 30 + 30}%)`;
        } else if (value < 0.6) {
          // red to yellow
          const localValue = (value - 0.2) / (0.6 - 0.2);
          return `hsl(${0 + localValue * 60}, 95%, 60%)`;
        } else if (value < 0.8) {
          // yellow to lightgrey
          const localValue = (value - 0.6) / (0.8 - 0.6);
          return `hsl(60, ${90 - 45 * localValue}%, ${60 + 20 * localValue}%)`;
        } else {
          // light grey to blue
          const localValue = (value - 0.8) / (1 - 0.8);
          return `hsl(210, ${50 + 45 * localValue}%, ${80 - 20 * localValue}%)`;
        }
      };
    case ColorGradient.StopLightSunriseOkLab:
      return (value: number) => {
        if (value < 0.2) {
          // dark gray to red
          const localValue = value / 0.2;
          // return `hsl(0,  ${localValue * 80}%, ${localValue * 30 + 30}%)`;
          return `oklab(${0.85 * localValue} 0.3 0.2)`;
        } else if (value < 0.6) {
          // red to yellow
          const localValue = (value - 0.2) / (0.6 - 0.2);
          // return `hsl(${0 + localValue * 60}, 80%, 60%)`;
          return `oklab(0.85 ${0.3 - 0.35 * localValue} 0.2)`;
        } else if (value < 0.9) {
          // yellow to lightgrey
          const localValue = (value - 0.6) / (0.9 - 0.6);
          return `oklab(0.85 ${-0.05 + 0.05 * localValue} ${0.2 - 0.2 * localValue})`;
        } else {
          // light grey to blue
          const localValue = (value - 0.9) / (1 - 0.9);
          return `oklab(0.85 ${0 - 0.1 * localValue} ${0 - 0.5 * localValue})`;
        }
      };
    case ColorGradient.HueRainbowBlueToRed:
      // hsl(240, 90%, 60%) -> hsl(180, 80%, 60%) -> hsl(120, 90%, 60%) -> hsl(60, 90%, 60%) -> hsl(0, 90%, 60%)
      // No purples (hues between 240 and 360) because then high & low values would look similar
      return (value: number) => {
        return `hsl(${240 - value * 240}, 90%, 60%)`;
      };
    case ColorGradient.OklabRainbowBlueToRed:
      // OKLCH interpolation for more even perceptual spacing
      // Less greens, more oranges, still no purples (avoiding a loop)
      return (value: number) => {
        const lightness = 80 - Math.sin(value * Math.PI * 2 + 1) * 20; // Vary lightness to add more distinction between colors
        const chroma = 60;
        const hue = 270 - value * 270;
        return `oklch(${lightness}% ${chroma}% ${hue})`;
      };
    case ColorGradient.SequentialBlue:
      // Same blue as the primary button color
      // hsl(211, 80%, 100%) -> hsl(211, 80%, 75%) -> hsl(211, 80%, 50%)
      return (value: number) => {
        return `hsl(211, 80%, ${95 - value * 50}%)`;
      };
    case ColorGradient.SequentialOrange:
      // hsl(30, 80%, 100%) -> hsl(30, 80%, 75%) -> hsl(30, 80%, 50%)
      return (value: number) => {
        return `hsl(30, 80%, ${95 - value * 50}%)`;
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
    case ColorGradient.StopLightSunset:
      return (value: number) => getColorGradientFunction(ColorGradient.StopLightSunrise)(1 - value);
    case ColorGradient.StopLightSunsetOkLab:
      return (value: number) =>
        getColorGradientFunction(ColorGradient.StopLightSunriseOkLab)(1 - value);
    case ColorGradient.HueRainbowRedToBlue:
      return (value: number) =>
        getColorGradientFunction(ColorGradient.HueRainbowBlueToRed)(1 - value);
    case ColorGradient.OklabRainbowRedToBlue:
      return (value: number) =>
        getColorGradientFunction(ColorGradient.OklabRainbowBlueToRed)(1 - value);
    case ColorGradient.SequentialBlueReverse:
      return (value: number) => getColorGradientFunction(ColorGradient.SequentialBlue)(1 - value);
    case ColorGradient.SequentialOrangeReverse:
      return (value: number) => getColorGradientFunction(ColorGradient.SequentialOrange)(1 - value);

    // Categorical
    case ColorGradient.ScatteredOklab:
      return (value: number) => {
        const lightness = 70 + Math.sin(value * Math.PI * 37) * 20;
        const chroma = 50 + Math.sin(value * Math.PI * 41) * 30; // Vary chroma in a pseudo-random way based on the value, using a sine function for smooth variation
        const hue = (value * 360 * 137.508) % 360;
        return `oklch(${lightness}% ${chroma}% ${hue})`;
      };
    case ColorGradient.ScatteredRGB:
      return (value: number) => {
        // Multiply the normalized value by a prime number and take the fractional part to
        // get a pseudo-random but deterministic value. Slightly modified to make it brighter.

        const red = ((value * 31) % 1 ** 0.5) * 0.8 + 0.2;
        const green = ((value * 37) % 1 ** 0.5) * 0.8 + 0.2;
        const blue = ((value * 41) % 1 ** 0.5) * 0.8 + 0.2;
        return `rgb(${red * 255}, ${green * 255}, ${blue * 255})`;
      };
    default:
      enforceExhaustiveSwitch(colorGradient);
  }
}
