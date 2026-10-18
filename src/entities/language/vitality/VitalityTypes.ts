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
  UNESCO = 'UNESCO',
  Glottolog = 'Glottolog',
}

export enum LanguageISOStatus {
  Living = 9, // L
  Constructed = 3, // C
  Historical = 1, // H
  Extinct = 0, // E
  SpecialCode = -1, // S
}

export enum UNESCOEndangerment {
  Safe = 9,
  Vulnerable = 7,
  DefinitelyEndangered = 5,
  SeverelyEndangered = 3,
  CriticallyEndangered = 1,
  Extinct = -1,
}
