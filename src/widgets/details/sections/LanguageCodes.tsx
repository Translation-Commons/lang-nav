import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';

import { LanguageData, LanguageField } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

const LanguageCodes: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { codeISO6391, sourceSpecific } = lang;
  const { Glottolog, ISO, CLDR } = sourceSpecific;

  return (
    <DetailsSection title="Codes">
      <DetailsField title="Language Code:">{lang.ID}</DetailsField>
      <DetailsField title="Glottocode:">
        {Glottolog.code ? (
          <>
            {Glottolog.code}
            <LinkButton href={`https://glottolog.org/resource/languoid/id/${Glottolog.code}`}>
              Glottolog
            </LinkButton>
          </>
        ) : (
          <Deemphasized>Not in Glottolog</Deemphasized>
        )}
      </DetailsField>
      <DetailsField title="ISO Code:">
        {ISO.code ? (
          <>
            {ISO.code}
            {codeISO6391 ? ` | ${codeISO6391}` : ''}
            {lang.warnings && lang.warnings[LanguageField.isoCode] && (
              <Hoverable
                hoverContent={lang.warnings[LanguageField.isoCode]}
                style={{ marginLeft: '0.125em' }}
              >
                <TriangleAlertIcon size="1em" color="var(--color-text-yellow)" />
              </Hoverable>
            )}
            <LinkButton href={`https://iso639-3.sil.org/code/${ISO.code}`}>ISO Catalog</LinkButton>
          </>
        ) : (
          <Deemphasized>Not in ISO catalog</Deemphasized>
        )}
      </DetailsField>
      <DetailsField title="CLDR Code:">
        {CLDR.code ? (
          <>
            {CLDR.code}
            <LinkButton
              href={`https://github.com/unicode-org/cldr/blob/main/common/main/${CLDR.code}.xml`}
            >
              CLDR XML
            </LinkButton>
          </>
        ) : (
          <Deemphasized>Not in CLDR</Deemphasized>
        )}
      </DetailsField>
      {ISO.code && (
        <DetailsField title="Other external links:">
          <LinkButton href={`https://www.ethnologue.com/language/${ISO.code}`}>
            Ethnologue
          </LinkButton>
          <LinkButton href={`https://en.wikipedia.org/wiki/ISO_639:${ISO.code}`}>
            Wikipedia
          </LinkButton>
        </DetailsField>
      )}
    </DetailsSection>
  );
};

export default LanguageCodes;
