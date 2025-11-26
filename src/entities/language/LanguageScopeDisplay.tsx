import React from 'react';

import Pill from '@shared/ui/Pill';

import { LanguageData, LanguageScope, LanguageSource } from './LanguageTypes';

const LanguageScopeDisplay: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const scopesBySource = getScopeBySource(lang);

  return (
    <div style={{ display: 'inline-flex', gap: '0.5em', flexWrap: 'wrap' }}>
      {Object.entries(scopesBySource).map(([scope, sources]) => (
        <div key={scope} style={{ display: 'flex', gap: '0.25em' }}>
          {scope}
          {sources.includes(LanguageSource.ISO) && <Pill>ISO</Pill>}
          {sources.includes(LanguageSource.CLDR) && <Pill>CLDR</Pill>}
          {sources.includes(LanguageSource.Glottolog) && <Pill>Glottolog</Pill>}
        </div>
      ))}
    </div>
  );
};

export default LanguageScopeDisplay;

function getScopeBySource(lang: LanguageData): Partial<Record<LanguageScope, LanguageSource[]>> {
  const { scope, ISO, CLDR, Glottolog } = lang;
  const scopes: Partial<Record<LanguageScope, LanguageSource[]>> = {};
  if (scope) scopes[scope] = [LanguageSource.Combined];
  if (ISO.scope) {
    if (!scopes[ISO.scope]) scopes[ISO.scope] = [];
    scopes[ISO.scope]?.push(LanguageSource.ISO);
  }
  if (CLDR.scope) {
    if (!scopes[CLDR.scope]) scopes[CLDR.scope] = [];
    scopes[CLDR.scope]?.push(LanguageSource.CLDR);
  }
  if (Glottolog.scope) {
    if (!scopes[Glottolog.scope]) scopes[Glottolog.scope] = [];
    scopes[Glottolog.scope]?.push(LanguageSource.Glottolog);
  }
  return scopes;
}
