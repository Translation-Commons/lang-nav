import { LanguageSource } from '@entities/language/LanguageTypes';
import React from 'react';

import { usePageParams } from '../../PageParamsProvider';
import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';

const LanguageListSourceSelector: React.FC = () => {
  const { languageSource, updatePageParams } = usePageParams();
  const selectorDescription = (
    <>
      Languages have fuzzy boundaries and different sources categorize potential languages
      differently. For example, what&apos;s a dialect versus a language, or if a language is even
      attested. Use this option to change what languages appear and what they are considered (family
      / individual / dialect). This may also change the language codes, names, and parent/child
      relationships.
    </>
  );

  return (
    <Selector
      selectorLabel="Source of the List of Languages"
      selectorDescription={selectorDescription}
      options={Object.values(LanguageSource)}
      display={SelectorDisplay.ButtonList}
      onChange={(languageSource: LanguageSource) => updatePageParams({ languageSource })}
      selected={languageSource}
      getOptionDescription={(languageSource) => (
        <LanguageSourceDescription languageSource={languageSource} />
      )}
    />
  );
};

const LanguageSourceDescription: React.FC<{ languageSource: LanguageSource }> = ({
  languageSource,
}) => {
  switch (languageSource) {
    case LanguageSource.All:
      return (
        <>
          <label>All:</label>Show all languages and dialects, regardless of where it was defined.
        </>
      );
    case LanguageSource.ISO:
      return (
        <>
          <label>International Standards Organization (ISO):</label>The languages and macrolanguages
          defined by the International Standards Organization, standard # 639. Unicode and most
          technology companies use this list to define the possible languages. This option
          specifically shows only 3-letter codes from either the ISO 639-3 standard for regular
          languages and macrolanguages or the ISO 639-5 standard for language families.
        </>
      );
    case LanguageSource.BCP:
      return (
        <>
          <label>Best Current Practice (BCP):</label> The Internet Engineering Task Force
          (IETF)&apos;s Best Current Practice (BCP) 47 standard defines how language codes should be
          composed for usage on the internet. It is largely based on the ISO 639 standard -- the big
          difference is that it recommends using the ISO 639-1 2-letter codes when available. That
          standard also includes how complex descriptions are defined, such as handling specific
          variants (eg. <code>en-US</code> for American English, <code>en-GB</code> for British
          English, or <code>zh-Hant</code> for Traditional Chinese).
        </>
      );
    case LanguageSource.UNESCO:
      return (
        <>
          <label>UNESCO&apos;s World Atlas of Languages (WAL):</label>The languages that have been
          agreed by the UNESCO authorities and representatives of UN member states to show in the
          World Atlas of Languages.
        </>
      );
    case LanguageSource.Glottolog:
      return (
        <>
          <label>Glottolog:</label>The languoids shown in the Glottolog database. This schema will
          include many more language families than ISO.
        </>
      );
    case LanguageSource.CLDR:
      return (
        <>
          <label>CLDR:</label>The languages supported by Unicode&apos;s tooling that is used by most
          technology platforms. The main components are the CLDR --the <strong>C</strong>ommon{' '}
          <strong>L</strong>ocale <strong>D</strong>ata <strong>R</strong>epository-- and ICU --the{' '}
          <strong>I</strong>nternational <strong>C</strong>omponents for <strong>U</strong>nicode.
          These languages are usually the same as the ISO languages but the language-keys prefer the
          ISO 639-1 language code if it exists (eg. <code>en</code>, <code>es</code>) over the ISO
          639-3 language code (eg. <code>eng</code>, <code>spa</code>).
        </>
      );
  }
};

export default LanguageListSourceSelector;
