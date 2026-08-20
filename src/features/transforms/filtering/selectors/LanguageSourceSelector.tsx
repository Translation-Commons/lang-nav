import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay, useSelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import LanguageSourceDescription from '@entities/language/LanguageSourceDescription';
import { LanguageSource } from '@entities/language/LanguageTypes';

const values = [
  LanguageSource.Combined,
  LanguageSource.Glottolog,
  LanguageSource.ISO,
  LanguageSource.BCP,
  LanguageSource.CLDR,
];

const LanguageSourceSelector: React.FC = () => {
  const { languageSource, updatePageParams } = usePageParams();
  const { display } = useSelectorDisplay();

  return (
    <Selector
      selectorLabel={display === SelectorDisplay.FilterList ? 'Language Authority' : undefined}
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
      let&apos;s look at Chinese through the lens of different sources:
      <ul>
        <li>
          <strong>Glottolog</strong> features <code>clas1255</code> as &quot;Classical-Middle-Modern
          Sinitic&quot;, a language family since it contains multiple language families
          (Middle-Modern Sinitic [<code>midd1354</code>], ...) and languages in them (Mandarin [
          <code>mand1415</code>], Cantonese [<code>yuec1235</code>], ...).
        </li>
        <li>
          <strong>ISO</strong> uses the code <code>zho</code>, calls it &quot;Chinese&quot; and
          considers it a macrolanguage. It has direct descendants like Mandarin [<code>cmn</code>]
          and Cantonese [<code>yue</code>].
        </li>
        <li>
          <strong>BCP-47</strong> closely follows ISO usually but when possible uses 2-letter codes,
          so <code>zh</code> for Chinese.
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

export default LanguageSourceSelector;
