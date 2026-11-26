// Force it not to use 0 because that will be treated as falsy and removed
export enum ColorGradient {
  DivergingBlueToOrange = 1, // Blue - White - Orange
  DivergingOrangeToBlue = 2, // Orange - White - Blue
  DivergingRedToGreen = 3, // Red - White - Green
  DivergingGreenToRed = 4, // Green - White - Red
  StopLightRedToGreen = 11, // Red - Yellow - Green
  StopLightGreenToRed = 12, // Green - Yellow - Red
  StopLightSunrise = 13, // Black - Red - Orange - Yellow - Blue
  StopLightSunset = 14, // Blue - Yellow - Orange - Red - Black
  StopLightSunriseOkLab = 15, // Black - Red - Orange - Yellow - Blue in Oklab space
  StopLightSunsetOkLab = 16, // Blue - Yellow - Orange - Red - Black in Oklab space
  HueRainbowBlueToRed = 21, // Blue - Green - Yellow - Orange - Red
  HueRainbowRedToBlue = 22, // Red - Orange - Yellow - Green - Blue
  OklabRainbowBlueToRed = 23, // Blue - Green - Yellow - Orange - Red with more even perceptual spacing (via Oklab interpolation)
  OklabRainbowRedToBlue = 24, // Red - Orange - Yellow - Green - Blue with more even perceptual spacing (via Oklab interpolation)
  SequentialBlue = 31, // Light to Dark Blue
  SequentialBlueReverse = 32, // Dark to Light Blue
  SequentialOrange = 33, // Light to Dark Orange
  SequentialOrangeReverse = 34, // Dark to Light Orange

  // Pseudo-randomly assigned colors (via hashing) for categorical variables
  ScatteredOklab = 41,
  ScatteredRGB = 43,
}
