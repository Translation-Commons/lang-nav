import { SortBy } from '../sorting/SortTypes';

export type ColorBy = SortBy | 'None';

// Force it not to use 0 because that will be treated as falsy and removed
export enum ColorGradient {
  DivergingBlueToOrange = 1, // Blue - White - Orange
  DivergingOrangeToBlue = 2, // Orange - White - Blue
  DivergingRedToGreen = 3, // Red - White - Green
  DivergingGreenToRed = 4, // Green - White - Red
  StopLightRedToGreen = 11, // Red - Yellow - Green
  StopLightGreenToRed = 12, // Green - Yellow - Red
  HueRainbowBlueToRed = 21, // Blue - Green - Yellow - Orange - Red
  HueRainbowRedToBlue = 22, // Red - Orange - Yellow - Green - Blue
  SequentialBlue = 31, // Light to Dark Blue
  SequentialBlueReverse = 32, // Dark to Light Blue
  SequentialOrange = 33, // Light to Dark Orange
  SequentialOrangeReverse = 34, // Dark to Light Orange
}
