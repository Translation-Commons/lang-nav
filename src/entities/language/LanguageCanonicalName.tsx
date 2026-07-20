import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import usePageParams from '@features/params/usePageParams';

import Highlightable from '@shared/ui/old/Highlightable';
import LinkButton from '@shared/ui/old/LinkButton';
import Pill from '@shared/ui/old/Pill';

import { LanguageData } from './LanguageTypes';

const LanguageCanonicalName: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { searchString } = usePageParams();
  const { codeDisplay, nameCanonical, Glottolog, ISO, CLDR, Ethnologue } = lang;

  return (
    <div className="inline-flex items-center gap-1">
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
        >
          <Pill>CLDR</Pill>
        </Hoverable>
      )}
      {Ethnologue.name === nameCanonical && (
        <Hoverable
          hoverContent={
            <>
              <div>Same name as is in the Ethnologue data</div>
              <LinkButton href={`https://www.ethnologue.com/language/${Ethnologue.code}`}>
                View Ethnologue Entry
              </LinkButton>
            </>
          }
        >
          <Pill>Ethnologue</Pill>
        </Hoverable>
      )}
    </div>
  );
};

export default LanguageCanonicalName;
