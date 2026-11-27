// Force it not to use 0 because that will be treated as falsy and removed
export enum ColorGradient {
  DivergingBlueToOrange = 1, // Blue - White - Orange
  DivergingRedToGreen = 3, // Red - White - Green
  StopLightRedToGreen = 11, // Red - Yellow - Green
  StopLightSunrise = 13, // Black - Red - Orange - Yellow - Blue
  StopLightSunriseOkLab = 15, // Black - Red - Orange - Yellow - Blue in Oklab space
  HueRainbowBlueToRed = 21, // Blue - Green - Yellow - Orange - Red
  OklabRainbowBlueToRed = 23, // Blue - Green - Yellow - Orange - Red with more even perceptual spacing (via Oklab interpolation)
  SequentialBlue = 31, // Light to Dark Blue
  SequentialBlueFromDark = 32, // Black to Blue
  SequentialOrange = 33, // Light to Dark Orange
  SequentialOrangeFromDark = 34, // Black to Orange

  // Pseudo-randomly assigned colors (via hashing) for categorical variables
  ScatteredOklab = 41,
  ScatteredRGB = 43,

  // Negative values for reverse direction
  DivergingOrangeToBlue = -1, // Orange - White - Blue
  DivergingGreenToRed = -3, // Green - White - Red
  StopLightGreenToRed = -11, // Green - Yellow - Red
  StopLightSunset = -13, // Blue - Yellow - Orange - Red - Black
  StopLightSunsetOkLab = -15, // Blue - Yellow - Orange - Red - Black in Oklab space
  HueRainbowRedToBlue = -21, // Red - Orange - Yellow - Green - Blue
  OklabRainbowRedToBlue = -23, // Red - Orange - Yellow - Green - Blue with more even perceptual spacing (via Oklab interpolation)
  SequentialBlueReverse = -31, // Dark to Light Blue
  SequentialBlueFromDarkReverse = -32, // Blue to Black
  SequentialOrangeReverse = -33, // Dark to Light Orange
  SequentialOrangeFromDarkReverse = -34, // Orange to Black
  ScatteredOklabReverse = -41,
  ScatteredRGBReverse = -43,
}
