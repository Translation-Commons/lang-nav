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
}

export enum LanguageISOStatus {
  Living = 9, // L
  Constructed = 3, // C
  Historical = 1, // H
  Extinct = 0, // E
  SpecialCode = -1, // S
}
