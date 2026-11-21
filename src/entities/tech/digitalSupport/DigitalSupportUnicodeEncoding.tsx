import type { LanguageData } from '@entities/language/LanguageTypes';

export function getUnicodeEncodingScore(lang: LanguageData): number {
  // Check if the primary writing system is unicode encoded
  const primaryEncoded = !!lang.primaryWritingSystem?.unicodeVersion;
  if (primaryEncoded) return 10;

  // Otherwise check alternative writing systems
  const otherWritingSystems = Object.values(lang.writingSystems ?? {});
  const otherEncoded = Object.values(lang.writingSystems ?? {})
    .map((ws) => ws.unicodeVersion)
    .filter(Boolean);
  return (otherEncoded.length / otherWritingSystems.length) * 10;
}
