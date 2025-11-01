import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';

import LinkButton from '@shared/ui/LinkButton';
import Pill from '@shared/ui/Pill';

import { LanguageData } from './LanguageTypes';

const LanguageCanonicalName: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { codeDisplay, codeISO6391, nameDisplay, sourceSpecific } = lang;
  const { Glottolog, ISO, CLDR } = sourceSpecific;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}>
      {nameDisplay}
      {Glottolog.name === nameDisplay && (
        <Hoverable
          hoverContent={
            <>
              <div>Same name as is in Glottolog</div>
              <LinkButton href={`https://glottolog.org/resource/languoid/id/${Glottolog.code}`}>
                View Glottolog Entry
              </LinkButton>
            </>
          }
          style={{ backgroundColor: 'transparent' }}
        >
          <Pill>Glottolog</Pill>
        </Hoverable>
      )}
      {ISO.name === nameDisplay && (
        <Hoverable
          hoverContent={
            <>
              <div>Same name as is in the ISO catalog</div>
              <LinkButton href={`https://iso639-3.sil.org/code/${ISO.code ?? codeDisplay}`}>
                View ISO Entry
              </LinkButton>
            </>
          }
          style={{ backgroundColor: 'transparent' }}
        >
          <Pill>ISO</Pill>
        </Hoverable>
      )}
      {CLDR.name === nameDisplay && (
        <Hoverable
          hoverContent={
            <>
              <div>Same name as is in the CLDR data</div>
              <LinkButton
                href={`https://www.unicode.org/cldr/charts/48/summary/${codeISO6391 ?? ISO.code ?? codeDisplay}.html`}
              >
                View CLDR Entry
              </LinkButton>
            </>
          }
          style={{ backgroundColor: 'transparent' }}
        >
          <Pill>CLDR</Pill>
        </Hoverable>
      )}
    </div>
  );
};

export default LanguageCanonicalName;
