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
  Eth2013 = 'Eth2013',
  Eth2025 = 'Eth2025',
}

export enum VitalityEthnologueCoarse {
  Institutional = 9,
  Stable = 6,
  Endangered = 3,
  Extinct = 0,
}

export enum VitalityEthnologueFine {
  National = 9,
  Regional = 8,
  Trade = 7,
  Educational = 6,
  Developing = 5,
  Threatened = 4,
  Shifting = 3,
  Moribund = 2,
  Dormant = 1,
  Extinct = 0,
}

export enum VitalityISO {
  Living = 9, // L
  Constructed = 3, // C
  Historical = 1, // H
  Extinct = 0, // E
  SpecialCode = -1, // S
}

export type VitalityInfo = {
  score: number | undefined;
  label: string | undefined;
  explanation: React.ReactNode;
};

export type AllVitalityInfo = Record<VitalitySource, VitalityInfo>;
