import React from 'react';

import type { LanguageData } from '@entities/language/LanguageTypes';

import Deemphasized from '@shared/ui/Deemphasized';

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

export const UnicodeEncodingExplanation: React.FC<{ ent: LanguageData }> = ({ ent }) => {
  const score = getUnicodeEncodingScore(ent);
  const writingSystems = Object.values(ent.writingSystems ?? {}).sort((a, b) =>
    a.ID === ent.primaryScriptCode ? -1 : (a.unicodeVersion ?? 1000) - (b.unicodeVersion ?? 1000),
  );
  return (
    <div>
      Unicode Encoding Score: {score}
      <hr className="my-2" />
      <ul>
        {writingSystems.map((ws) => (
          <li key={ws.ID}>
            {ws.nameDisplay}:{' '}
            {ws.unicodeVersion ? (
              `Unicode ${ws.unicodeVersion}`
            ) : (
              <Deemphasized>Not encoded yet</Deemphasized>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
