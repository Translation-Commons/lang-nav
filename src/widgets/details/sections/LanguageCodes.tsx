import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import LanguageRetirementReason from '@entities/language/LanguageRetirementReason';
import LanguageScopeDisplay from '@entities/language/LanguageScopeDisplay';
import { LanguageData, LanguageField, LanguageSource } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

import LanguageCodeDescriptionBySource from '@strings/LanguageCodeDescriptionBySource';

const LanguageCodes: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { Glottolog, ISO, CLDR } = lang;

  return (
    <DetailsSection title="Language Codes">
      <DetailsField title="Scope:">
        <LanguageScopeDisplay lang={lang} />
      </DetailsField>
      <DetailsField
        title="Canonical Language ID"
        description={<LanguageCodeDescriptionBySource languageSource={LanguageSource.Combined} />}
      >
        {lang.ID}
      </DetailsField>
      <DetailsField
        title="Glottocode"
        description={<LanguageCodeDescriptionBySource languageSource={LanguageSource.Glottolog} />}
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
        title="ISO Code"
        description={
          <>
            <LanguageCodeDescriptionBySource languageSource={LanguageSource.ISO} />
            {ISO.code6391 && (
              <div style={{ marginTop: '0.5em' }}>
                There also is a 2-letter ISO 639-1 code for this language.
              </div>
            )}
          </>
        }
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
        title="CLDR Code"
        description={<LanguageCodeDescriptionBySource languageSource={LanguageSource.CLDR} />}
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
