import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import Pill from '@shared/ui/Pill';

import { getLanguageScopeDescription, getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import { LanguageData, LanguageScope, LanguageSource } from './LanguageTypes';

const LanguageScopeDisplay: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const scopesBySource = getScopeBySource(lang);

  return (
    <div style={{ display: 'inline-flex', gap: '0.5em', flexWrap: 'wrap' }}>
      {Object.values(LanguageScope)
        .filter((s) => typeof s === 'number')
        .filter((scope) => scopesBySource[scope]?.length > 0)
        .map((scope) => (
          <div key={scope} style={{ display: 'flex', gap: '0.25em' }}>
            {scopesBySource[scope]?.length > 0 && (
              <Hoverable hoverContent={getLanguageScopeDescription(scope)}>
                {getLanguageScopeLabel(scope)}
              </Hoverable>
            )}
            {scopesBySource[scope]?.includes(LanguageSource.ISO) && <Pill>ISO</Pill>}
            {scopesBySource[scope]?.includes(LanguageSource.CLDR) && <Pill>CLDR</Pill>}
            {scopesBySource[scope]?.includes(LanguageSource.Glottolog) && <Pill>Glottolog</Pill>}
          </div>
        ))}
    </div>
  );
};

export default LanguageScopeDisplay;

function getScopeBySource(lang: LanguageData): LanguageSource[][] {
  const { scope, ISO, CLDR, Glottolog } = lang;
  const scopes: LanguageSource[][] = Array(LanguageScope.Family + 1)
    .fill(null)
    .map(() => []); // index by LanguageScope value
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
