import { LanguageSource } from '@entities/language/LanguageTypes';

import LinkButton from '@shared/ui/LinkButton';

function LanguageCodeDescriptionBySource({ languageSource }: { languageSource: LanguageSource }) {
  switch (languageSource) {
    case LanguageSource.Combined:
      return (
        <>
          The canonical language code used throughout this application. Generally if there is an ISO
          639-3 or ISO 639-5 code assigned to the language, that is used. Most other language
          families and dialects without an ISO code have a Glottocode. Some entries may have a
          custom code from another source, but the entry may not be recognized by most sources.
        </>
      );
    case LanguageSource.ISO:
      return (
        <>
          The primary 3-letter code used by most systems, eg. <code>eng</code> for English and{' '}
          <code>zho</code> for Chinese.
          <LinkButton href="https://iso639-3.sil.org/">ISO 639-3 standard</LinkButton>
          <LinkButton href="https://www.loc.gov/standards/iso639-5/">ISO 639-5 standard</LinkButton>
        </>
      );
    case LanguageSource.Glottolog:
      return (
        <>
          The Glottocode assigned by the Glottolog project, eg. <code>stan1293</code> for English
          (formerly named <strong>Stan</strong>dard English in the system), <code>clas1255</code>{' '}
          for Chinese as considered on the internet (Glottolog name <strong>Clas</strong>
          sical-Middle-Modern Sinitic)
          <LinkButton href="https://glottolog.org/resource/languoid/id/">
            Glottolog standard
          </LinkButton>
        </>
      );
    case LanguageSource.BCP:
      return (
        <>
          The Best Current Practices (BCP) BCP-47 language tag as used in IETF standards. Usually
          this is the same as the ISO 639-3 code (eg. <code>cmn</code> for Mandarin) but if there is
          a 2-letter code defined in ISO 639-1, that is used instead (eg. <code>zh</code> for
          Chinese instead of <code>zho</code>).
        </>
      );
    case LanguageSource.CLDR:
      return (
        <>
          The CLDR language code as used in the Unicode Common Locale Data Repository (CLDR). This
          is usually the BCP code, but macrolanguages are handled differently. Particularly, the
          primary language within a macrolanguage is assigned the code instead. So Chinese{' '}
          <code>zh</code> is used for Mandarin <code>cmn</code> and Malayic <code>ms</code> is used
          for Standard Malay <code>zsm</code>.
          <LinkButton href="https://www.unicode.org/cldr/charts/latest/supplemental/locale_coverage.html">
            CLDR project page
          </LinkButton>
        </>
      );
    case LanguageSource.UNESCO:
      return (
        <>
          UNESCO has not published its own language codes, so this system is assuming it uses the
          ISO codes.
        </>
      );
  }
}

export default LanguageCodeDescriptionBySource;
