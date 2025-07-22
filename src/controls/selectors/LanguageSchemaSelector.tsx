import React from 'react';

import { LanguageSchema } from '../../types/LanguageTypes';
import Selector from '../components/Selector';
import SingleChoiceOptions from '../components/SingleChoiceOptions';
import { usePageParams } from '../PageParamsContext';

const LanguageSchemaSelector: React.FC = () => {
  const { languageSchema, updatePageParams } = usePageParams();
  const selectorDescription =
    "Languages have fuzzy boundaries and different authorities categorize potential languages differently. For example, what's a dialect versus a language, or if a language is even attested. Use this option to change what languages appear and what they are considered (family / individual / dialect). This may also change the language code & language name shown.";

  return (
    <Selector
      selectorLabel="Language Definition"
      selectorDescription={selectorDescription}
      appearance="list"
    >
      <SingleChoiceOptions<LanguageSchema>
        mode="flat"
        options={Object.values(LanguageSchema)}
        onChange={(languageSchema: LanguageSchema) => updatePageParams({ languageSchema })}
        selected={languageSchema}
        getOptionDescription={(languageSchema) => (
          <>
            <div style={{ marginBottom: 8 }}>{selectorDescription}</div>
            <LanguageSchemaDescription languageSchema={languageSchema} />
          </>
        )}
      />
    </Selector>
  );
};

const LanguageSchemaDescription: React.FC<{ languageSchema: LanguageSchema }> = ({
  languageSchema,
}) => {
  switch (languageSchema) {
    case LanguageSchema.Inclusive:
      return (
        <>
          <label>Inclusive:</label>Show all languages and dialects, regardless of where it was
          defined.
        </>
      );
    case LanguageSchema.ISO:
      return (
        <>
          <label>International Standards Organization (ISO):</label>The languages and macrolanguages
          defined by the International Standards Organization, standard # 639. Unicode and most
          technology companies use this list to define the possible languages. This option
          specifically shows only 3-letter codes from either the ISO 639-3 standard for regular
          languages and macrolanguages or the ISO 639-5 standard for language families.
        </>
      );
    case LanguageSchema.UNESCO:
      return (
        <>
          <label>UNESCO&apos;s World Atlas of Languages (WAL):</label>The languages that have been
          agreed by the UNESCO authorities and representatives of UN member states to show in the
          World Atlas of Languages.
        </>
      );
    case LanguageSchema.Glottolog:
      return (
        <>
          <label>Glottolog:</label>The languoids shown in the Glottolog database. This schema will
          include many more language families than ISO.
        </>
      );
    case LanguageSchema.CLDR:
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

export default LanguageSchemaSelector;
