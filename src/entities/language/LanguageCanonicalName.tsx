import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';
import usePageParams from '@features/params/usePageParams';

import Highlightable from '@shared/ui/Highlightable';
import LinkButton from '@shared/ui/LinkButton';
import Pill from '@shared/ui/Pill';

import { LanguageData } from './LanguageTypes';

const LanguageCanonicalName: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { searchString } = usePageParams();
  const { codeDisplay, nameCanonical, Glottolog, ISO, CLDR } = lang;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}>
      <Highlightable text={nameCanonical} searchPattern={searchString}></Highlightable>
      {Glottolog.name === nameCanonical && (
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
      {ISO.name === nameCanonical && (
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
      {CLDR.name === nameCanonical && (
        <Hoverable
          hoverContent={
            <>
              <div>Same name as is in the CLDR data</div>
              <LinkButton
                href={`https://www.unicode.org/cldr/charts/48/summary/${ISO.code6391 ?? ISO.code ?? codeDisplay}.html`}
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
