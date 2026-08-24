import React from 'react';

import { EntityType } from '@features/params/PageParamTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

const EntityTypeDescription: React.FC<{ entityType: EntityType }> = ({ entityType }) => {
  switch (entityType) {
    case EntityType.Census:
      return (
        <>
          <label>Census:</label> A count of people in a given area -- for this site this is
          typically the count of people that speak or understand a language.
        </>
      );
    case EntityType.Language:
      return (
        <>
          <label>Language (Languoid):</label>A verbal communication system used by multiple people.
          Languages should be mutually intelligible, whereas a dialect is a subset of a language
          defined by differences in lexicon and pronunciation. Since languages families, contested
          languages, and dialects are included it is more precise to consider these
          &quot;Languoids&quot;.
        </>
      );
    case EntityType.Locale:
      return (
        <>
          <label>Locale:</label>The combination of a language and territory -- used to express how
          many people speak a language in a given area or if a language is officially supported.
          Some locales specify a particular writing system and/or variation information (dialect,
          orthography...).
        </>
      );
    case EntityType.Territory:
      return (
        <>
          <label>Territory:</label>A geographical unit. Some may not have universal recognition.
          Currently showing both countries as well as dependencies (eg. Hong Kong) that have
          separate ISO codes.
        </>
      );
    case EntityType.WritingSystem:
      return (
        <>
          <label>Writing System:</label>A system for writing a language to a persistent visual
          media. For instance Latin alphabet, Han characters, cursive Arabic script. Some systems
          may contain other systems.
        </>
      );
    case EntityType.Variant:
      return (
        <>
          <label>Variant:</label>The Internet Assigned Numbers Authority (IANA) maintains an
          enumeration of language tags in common usage. The &quot;variant&quot; tags are used in
          composite locales in the form <code>ca_valencia</code> or <code>ca-u-va-valencia</code>.
          These are typically used to specify a particular orthography or dialect.
        </>
      );
    case EntityType.Keyboard:
      return (
        <>
          <label>Keyboard:</label>A keyboard layout for inputting text in a given language.
          Currently showing GBoard layouts, which may support transliteration between scripts.
        </>
      );
    case EntityType.Org:
      return (
        <>
          <label>Organization:</label>An incorporated entity that provides some service related to
          language. This includes census agencies, language advocacy organizations, research
          institutions, or tech companies.
        </>
      );
    default:
      enforceExhaustiveSwitch(entityType);
  }
};

export default EntityTypeDescription;
