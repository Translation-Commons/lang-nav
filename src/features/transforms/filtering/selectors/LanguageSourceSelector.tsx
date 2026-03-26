import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';

type Props = { display: SelectorDisplay };

const values = [
  LanguageSource.Combined,
  LanguageSource.Glottolog,
  LanguageSource.ISO,
  LanguageSource.BCP,
  LanguageSource.CLDR,
];

const LanguageSourceSelector: React.FC<Props> = ({ display }) => {
  const { languageSource, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel={display !== SelectorDisplay.InlineDropdown ? 'Language Authority' : undefined}
      selectorDescription={<LanguageSourceSelectorDescription />}
      options={values}
      onChange={(languageSource: LanguageSource) => updatePageParams({ languageSource })}
      selected={languageSource}
      display={display}
      getOptionDescription={(languageSource) => (
        <LanguageSourceDescription languageSource={languageSource} />
      )}
    />
  );
};

function LanguageSourceSelectorDescription() {
  return (
    <>
      This determines which authority we use to determine the list of languages shown. Different
      sources also may have different names, IDs, and classifications for languages. For example,
      let&apos;s look at Chinese through the lens of difference sources:
      <ul>
        <li>
          <strong>Glottolog</strong> features <code>clas1255</code> as &quot;Classical-Middle-Modern
          Sinitic&quot;, a language family since it contains multiple language families
          (Middle-Modern Sinitic [<code>midd1354</code>], ...) and languages in them (Mandarin [
          <code>mand1415</code>], Cantonese [<code>yuec1235</code>], ...).
        </li>
        <li>
          <strong>ISO</strong> uses the code <code>zho</code>, calls it &quot;Chinese&quot; and
          considers it a macrolanguage. It has direct descendents like Mandarin [<code>cmn</code>]
          and Cantonese [<code>yue</code>].
        </li>
        <li>
          <strong>BCP-47</strong> closely follows ISO usually but when possible users 2-letter
          codes, so <code>zh</code> for Chinese.
        </li>
        <li>
          <strong>CLDR</strong> treats the language code slightly differently since it is focused on
          lists of translations. Since the macrolanguage encompasses multiple languages, CLDR picks
          the largest representative (in this case Mandarin) to use the code <code>zh</code>.
          Technically it does not have information for Chinese as a macrolanguage (you may see it
          noted as <code>zh*</code>).
        </li>
        <li>
          <strong>Combined</strong> is curated by the Language Navigator team to combine language
          information from all above sources. We prefer the ISO 639-3 3-letter code when possible
          (in this case <code>zho</code>) and sometimes have a distinct name, in this case
          &quot;Chinese languages&quot; to reflect the fact that it is a macrolanguage.
        </li>
      </ul>
    </>
  );
}

const LanguageSourceDescription: React.FC<{ languageSource: LanguageSource }> = ({
  languageSource,
}) => {
  switch (languageSource) {
    case LanguageSource.Combined:
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

export default LanguageSourceSelector;
