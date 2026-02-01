export enum VitalityBucket {
  Strong = 'Strong',
  Medium = 'Medium',
  Low = 'Low',
  Extinct = 'Extinct',
  Unknown = 'Unknown',
}

export enum VitalitySource {
  Metascore = 'Metascore',
  ISO = 'ISO',
  Eth2012 = 'Eth2012',
  Eth2025 = 'Eth2025',
}

export enum VitalityEthnologueCoarse {
  Institutional = 9,
  Stable = 6,
  Endangered = 3,
  Extinct = 0,
}

// Expanded Graded Intergenerational Disruption Scale
// Converted to a 0-9 scale for easier comparison with other vitality scores
export enum VitalityEthnologueFine {
  // International (merged with National)
  National = 9,
  Regional = 8,
  // Wider Communication (merged with Trade)
  Trade = 7,
  Educational = 6,
  Developing = 5,
  // Vigorous (merged with Threatened)
  Threatened = 4,
  Shifting = 3,
  Moribund = 2,
  // Nearly Extinct (merged with Moribund)
  Dormant = 1,
  Extinct = 0,
}

export enum LanguageISOStatus {
  Living = 9, // L
  Constructed = 3, // C
  Historical = 1, // H
  Extinct = 0, // E
  SpecialCode = -1, // S
}
