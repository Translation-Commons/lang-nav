import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';

import LanguageRetirementReason from '@entities/language/LanguageRetirementReason';
import LanguageScopeDisplay from '@entities/language/LanguageScopeDisplay';
import { LanguageData, LanguageField } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

const LanguageCodes: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { Glottolog, ISO, CLDR } = lang;

  return (
    <DetailsSection title="Codes">
      <DetailsField title="Scope:">
        <LanguageScopeDisplay lang={lang} />
      </DetailsField>
      <DetailsField title="Language Code:">{lang.ID}</DetailsField>
      <DetailsField
        title="Glottocode:"
        endContent={
          Glottolog.code && (
            <LinkButton href={`https://glottolog.org/resource/languoid/id/${Glottolog.code}`}>
              Glottolog
            </LinkButton>
          )
        }
      >
        {Glottolog.code ? <>{Glottolog.code}</> : <Deemphasized>Not in Glottolog</Deemphasized>}
      </DetailsField>
      <DetailsField
        title="ISO Code:"
        endContent={
          <LinkButton href={`https://iso639-3.sil.org/code/${ISO.code}`}>ISO Catalog</LinkButton>
        }
      >
        {ISO.code ? (
          <>
            {ISO.code}
            {ISO.code6391 ? ` | ${ISO.code6391}` : ''}
            {lang.warnings && lang.warnings[LanguageField.isoCode] && (
              <Hoverable
                hoverContent={<LanguageRetirementReason lang={lang} />}
                style={{ marginLeft: '0.125em' }}
              >
                <TriangleAlertIcon size="1em" color="var(--color-text-yellow)" />
              </Hoverable>
            )}
          </>
        ) : (
          <Deemphasized>Not in ISO catalog</Deemphasized>
        )}
      </DetailsField>
      <DetailsField
        title="CLDR Code:"
        endContent={
          CLDR.code && (
            <LinkButton
              href={`https://github.com/unicode-org/cldr/blob/main/common/main/${CLDR.code}.xml`}
            >
              CLDR XML
            </LinkButton>
          )
        }
      >
        {CLDR.code ? <>{CLDR.code}</> : <Deemphasized>Not in CLDR</Deemphasized>}
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
