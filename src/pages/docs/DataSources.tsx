import React from 'react';

import DocsCard from '@widgets/docs/DocsCard';
import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

import InternalLink from '@features/params/InternalLink';

import { LanguageSource } from '@entities/language/LanguageTypes';

import ExternalLink from '@shared/ui/ExternalLink';

const DataSourcesPage: React.FC = () => {
  return (
    <DocsPageContainer title="Data Sources">
      <div>
        The data used in this application is sourced from various linguistic databases, including
        Glottolog, Ethnologue, and CLDR. This data is meant to be as public and freely available as
        possible so that all people can understand languages in context and make informed decisions
        about languages across the world.
      </div>
      <DocsSection title="Input databases">
        <DocsCard title="Manually collected from Censuses and Academic Papers">
          The Language Navigator team has manually collected population and recognition data from
          various government censuses and academic papers. Sometimes, source websites were no longer
          accessible but data was retrieved using the internet archive&apos;s{' '}
          <ExternalLink href="https://web.archive.org/">Wayback Machine</ExternalLink>.
        </DocsCard>
        <DocsCard title="Unicode & CLDR">
          <ExternalLink href="https://home.unicode.org/">The Unicode Consortium</ExternalLink>{' '}
          provides the Unicode standard for how writing systems are encoded for use on electronic
          devices and{' '}
          <ExternalLink href="https://cldr.unicode.org/">
            the Common Locale Data Repository (CLDR)
          </ExternalLink>
          .We initially bootstrapped much of the data from CLDR - which itself catalogs much of the
          world&apos;s languages in order to provide keyboard and user-interface support. It also
          provides much of the data for the ISO standards{' '}
          <ExternalLink href="https://iso639-3.sil.org/">ISO 639-3</ExternalLink>.
        </DocsCard>
        <DocsCard title="Glottolog" href="https://glottolog.org/">
          Glottolog is a comprehensive catalog of the world&apos;s languages, dialects, and language
          families. It provides an extensive taxonomy of languages and dialects in language
          families, information about the endangerment and location of languages, and a large
          bibliography for the languages. <strong>Citation:</strong> Hammarström, Harald & Forkel,
          Robert & Haspelmath, Martin & Bank, Sebastian. 2024. Glottolog 5.1. Leipzig: Max Planck
          Institute for Evolutionary Anthropology.{' '}
          <ExternalLink href="https://doi.org/10.5281/zenodo.10804357" /> (Available online at{' '}
          <ExternalLink href="http://glottolog.org/">Glottolog</ExternalLink>, Accessed on
          2024-10-29.)
        </DocsCard>
        <DocsCard title="Ethnologue" href="https://www.ethnologue.com/">
          Ethnologue is a reference work cataloging all of the world&apos;s known living languages.
          It provides information about the number of speakers, language families, and geographical
          distribution of languages. Ethnologue contains much more complete academic citations for
          similar information provided by this website. <strong>Citation:</strong> Eberhard, David
          M., Gary F. Simons, and Charles D. Fennig (eds.). 2025. Ethnologue: Languages of the
          World. Twenty-eighth edition. Dallas, Texas: SIL International. Online version:{' '}
          <ExternalLink href="https://www.ethnologue.com/" />. Note: Currently we have removed data
          from Ethnologue pending clarifications on the proper way to redistribute their data if
          any.
        </DocsCard>
        <DocsCard title="United Nations: UNESCO, UNStats, and UNData">
          <ExternalLink href="https://www.unesco.org/">
            United Nations Educational, Scientific and Cultural Organization (UNESCO)
          </ExternalLink>{' '}
          is a specialized agency of the United Nations that promotes international collaboration in
          education, science, and culture. They have built{' '}
          <ExternalLink href="https://en.wal.unesco.org/">
            World Atlas of Languages (WAL)
          </ExternalLink>{' '}
          -- a similar database that is focused specifically on contributions from UN member state
          delegates. Additionally,{' '}
          <ExternalLink href="https://unstats.un.org/unsd/demographic-social/census/">
            UNStats
          </ExternalLink>{' '}
          and <ExternalLink href="https://data.un.org/Default.aspx">UNData</ExternalLink> provide
          census data like population and literacy.
        </DocsCard>
      </DocsSection>

      <DocsSection title="Concepts">
        <DocsCard title="IDs">
          The various language IDs (eg. ISO 3166 territory codes or language glottocodes) come from
          their respective original database (ISO, Glottolog, CLDR). When an object has multiple
          identities, it has been manually matched by the Language Navigator team to a single
          entity. For instance, English is represented in CLDR by the ISO 639-1 code{' '}
          <InternalLink params={{ languageSource: LanguageSource.CLDR, objectID: 'eng' }}>
            en
          </InternalLink>
          , the ISO 639-3 code{' '}
          <InternalLink params={{ languageSource: LanguageSource.ISO, objectID: 'eng' }}>
            eng
          </InternalLink>
          , and the Glottocode{' '}
          <InternalLink params={{ languageSource: LanguageSource.Glottolog, objectID: 'eng' }}>
            stan1293
          </InternalLink>
          .
        </DocsCard>
        <DocsCard title="Names">
          The names are sourced from the original databases, with some manual adjustments to ensure
          consistency and clarity. When swapping between different language definitions the language
          names will update to match the one provided by the source for that definition. For
          example, Chinese as a macrolanguage is called &quot;Classical-Middle-Modern Sinitic&quot;
          in{' '}
          <ExternalLink href="https://glottolog.org/resource/languoid/id/clas1255">
            Glottolog
          </ExternalLink>
          .
        </DocsCard>
        <DocsCard title="Population">
          The population data comes from many sources. Some estimates are directly imported from
          government censuses or academic papers -- sometimes we had to interpret the intended
          language (eg. is &quot;Malay&quot; referring to standard Malay, vernacular Malay, or Malay
          as a macrolanguage). Some come from secondary sources like Wikipedia or CLDR. A few
          estimates, especially for regional locales, are approximations based on the related data.
        </DocsCard>
      </DocsSection>
    </DocsPageContainer>
  );
};

export default DataSourcesPage;
