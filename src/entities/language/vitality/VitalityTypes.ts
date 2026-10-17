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
  Glottolog = 'Glottolog',
}

export enum LanguageISOStatus {
  Living = 9, // L
  Constructed = 3, // C
  Historical = 1, // H
  Extinct = 0, // E
  SpecialCode = -1, // S
}

export enum GlottologEndangerment {
  Safe = 9,
  Vulnerable = 7,
  DefinitelyEndangered = 5,
  SeverelyEndangered = 3,
  CriticallyEndangered = 1,
  Extinct = -1,
}
