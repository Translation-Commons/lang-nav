import { ObjectType } from '@widgets/PageParamTypes';
import React from 'react';

const ObjectTypeDescription: React.FC<{ objectType: ObjectType }> = ({ objectType }) => {
  switch (objectType) {
    case ObjectType.Census:
      return (
        <>
          <label>Census:</label> A count of people in a given area -- for this site this is
          typically the count of people that speak or understand a language.
        </>
      );
    case ObjectType.Language:
      return (
        <>
          <label>Language (Languoid):</label>A verbal communication system used by multiple people.
          Languages should be mutually intelligible, whereas a dialect is a subset of a language
          defined by differences in lexicon and pronunciation. Since languages families, contested
          languages, and dialects are included it is more precise to consider these
          &quot;Languoids&quot;.
        </>
      );
    case ObjectType.Locale:
      return (
        <>
          <label>Locale:</label>The combination of a language and territory -- used to express how
          many people speak a language in a given area or if a language is officially supported.
          Some locales specify a particular writing system and/or variation information (dialect,
          orthography...).
        </>
      );
    case ObjectType.Territory:
      return (
        <>
          <label>Territory:</label>A geographical unit. Some may not have universal recognition.
          Currently showing both countries as well as dependencies (eg. Hong Kong) that have
          separate ISO codes.
        </>
      );
    case ObjectType.WritingSystem:
      return (
        <>
          <label>Writing System:</label>A system for writing a language to a persistent visual
          media. For instance Latin alphabet, Han characters, cursive Arabic script. Some systems
          may contain other systems.
        </>
      );
    case ObjectType.VariantTag:
      return (
        <>
          <label>Variant Tag:</label>The Internet Assigned Numbers Authority (IANA) maintains an
          enumeration of language tags in common usage. The &quot;variant&quot; tags are used in
          composite locales in the form <code>ca_valencia</code> or <code>ca-u-va-valencia</code>.
          These are typically used to specify a particular orthography or dialect.
        </>
      );
  }
};

export default ObjectTypeDescription;
