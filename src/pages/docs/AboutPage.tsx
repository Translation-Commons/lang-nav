import React, { ReactNode } from 'react';

import CreativeCommonsLicense from '@widgets/CreativeCommonsLicense';
import DocsCard from '@widgets/docs/DocsCard';
import DocsCardGrid from '@widgets/docs/DocsCardGrid';
import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

import InternalLink from '@features/params/InternalLink';

import { LanguageSource } from '@entities/language/LanguageTypes';

import ExternalLink from '@shared/ui/ExternalLink';

const AboutPage: React.FC = () => {
  return (
    <DocsPageContainer
      title={
        <>
          About <strong>Lang</strong>uage <strong>Nav</strong>igator
        </>
      }
    >
      <div style={{ display: 'flex', gap: '0.5em' }}>
        <ScrollButton href="#motivation">Motivation</ScrollButton>
        <ScrollButton href="#contributors">Contributors</ScrollButton>
        <ScrollButton href="#acknowledgments">Acknowledgments</ScrollButton>
        <ScrollButton href="#contact">Contact</ScrollButton>
        <ScrollButton href="#license">License</ScrollButton>
        <ScrollButton href="#data-sources">Data Sources</ScrollButton>
      </div>

      <p>
        The <strong>Lang</strong>uage <strong>Nav</strong>igator is a tool designed to help people
        explore and understand the relationships between different languages. It provides a
        user-friendly interface for visualizing language families, dialects, and other linguistic
        features and how they are situated across the globe.
      </p>

      <DocsSection title="Motivation">
        These are the values that guide the development of the Language Navigator and what we hope
        users will get out of it.
        <DocsCard title="Free and Open">
          The Language Navigator is built on the belief that language data should be accessible to
          everyone. We aim to provide a free and open-source tool that allows users to explore and
          understand the world&apos;s languages without barriers. We want to empower people to learn
          about languages, their relationships, and their relevance in today&apos;s digital world.
        </DocsCard>
        <DocsCard title="Actionable Insights">
          The Language Navigator is designed to provide actionable insights into the world of
          languages. We aim to help people make informed decisions about language use--whether in
          spoken context or digital communication. We also acknowledge that many of the languages
          represented here are endangered, or while thriving in spoken form, remain unsupported on
          digital platforms. Depending on your goals, this insight might inspire support efforts—or
          influence strategic prioritization.
        </DocsCard>
        <DocsCard title="Inclusive">
          The Language Navigator highlights not only widely spoken languages but also those
          recognized by specific communities, even if they lack global consensus. Where data is
          disputed or incomplete, we aim for transparency. Users can see{' '}
          <InternalLink params={{ languageSource: LanguageSource.Combined }}>
            all attested languages
          </InternalLink>{' '}
          or choose to follow specific standards like{' '}
          <InternalLink params={{ languageSource: LanguageSource.ISO }}>ISO 639-3/5</InternalLink>,{' '}
          <InternalLink params={{ languageSource: LanguageSource.Glottolog }}>
            Glottolog
          </InternalLink>
          , <InternalLink params={{ languageSource: LanguageSource.UNESCO }}>UNESCO</InternalLink>,
          or <InternalLink params={{ languageSource: LanguageSource.CLDR }}>CLDR</InternalLink>.
        </DocsCard>
      </DocsSection>

      <DocsSection title="Contributors">
        <div>
          The Language Navigator is a project by the{' '}
          <ExternalLink href="https://translationcommons.org">Translation Commons</ExternalLink>{' '}
          team, with this website spearheaded by{' '}
          <ExternalLink href="https://www.linkedin.com/in/conrad-nied-60993917">
            Conrad Nied
          </ExternalLink>
          . It is developed and maintained by a group of dedicated volunteers who are passionate
          about language and technology.
        </div>
      </DocsSection>

      <DocsSection title="Acknowledgments">
        <div>
          We would like to thank the following organizations for their contributions to this
          project:
        </div>
        <DocsCardGrid>
          <DocsCard title="The Unicode Consortium" href="https://home.unicode.org/">
            For providing the Unicode standard and the Common Locale Data Repository (CLDR), which
            serves as a foundation for the language data used in this application.
          </DocsCard>
          <DocsCard
            title="The Human Language Technology group at the bme.hu and mta.hu"
            href="https://hlt.bme.hu/en/projects/lingvit"
          >
            For their work cataloging language vitality and providing great insights on which data
            to use for this website.
          </DocsCard>
          <DocsCard title="Ethnologue" href="https://www.ethnologue.com/">
            For their comprehensive database of world languages, which serves as a valuable resource
            for this project.
          </DocsCard>
          <DocsCard title="Glottolog" href="https://www.glottolog.org/">
            For their work in cataloging the world&apos;s languages and providing a reliable
            reference for language classification.
          </DocsCard>
          <DocsCard
            title="United Nations: UNESCO, UNStats, and UNData"
            href="https://www.unesco.org/"
          >
            For their efforts in promoting linguistic diversity and providing valuable data on
            language use worldwide.
          </DocsCard>
          <DocsCard title="You, the viewer">
            For exploring and using this tool. Your curiosity and interest in languages is what
            drives this project forward.
          </DocsCard>
        </DocsCardGrid>
      </DocsSection>

      <DocsSection title="Contact">
        <div>
          If you have any questions, suggestions, or feedback about the Language Navigator, please{' '}
          <ExternalLink href="https://github.com/Translation-Commons/lang-nav/issues">
            file an issue on GitHub
          </ExternalLink>{' '}
          or send an email to{' '}
          <ExternalLink href="mailto:langnav-outreach@translationcommons.org">
            langnav-outreach@translationcommons.org
          </ExternalLink>
          . We are always looking for ways to improve the tool and enhance the quality of the
          language data we provide.
        </div>
      </DocsSection>

      <DocsSection title="License">
        <div>
          The code for the Language Navigator is licensed under the{' '}
          <ExternalLink href="https://opensource.org/license/mit/">MIT License</ExternalLink>. This
          means you are free to use, modify, and distribute the code, provided that you include the
          original copyright notice and license in any copies or substantial portions of the
          software.
        </div>
        <div>
          The proprietary language data, visualizations, and other content are licensed under{' '}
          <ExternalLink href="https://creativecommons.org/licenses/by-sa/4.0/">
            Creative Commons Attribution-ShareAlike 4.0
          </ExternalLink>
          . This means you are free to share and adapt the content, even for commercial purposes, as
          long as you give appropriate credit, provide a link to the license, and indicate if
          changes were made.
        </div>
        <CreativeCommonsLicense />
        <div>
          Icons used in this website are provided by{' '}
          <ExternalLink href="https://lucide.dev">Lucide</ExternalLink>, and are distributed under
          the ISC License. You can view the license{' '}
          <ExternalLink href="https://lucide.dev/license">here</ExternalLink>.
        </div>
        <div>
          The source code is available in a{' '}
          <ExternalLink href="https://github.com/Translation-Commons/lang-nav">
            GitHub repository
          </ExternalLink>
          . The data files are available in the{' '}
          <ExternalLink href="https://github.com/Translation-Commons/lang-nav/tree/master/public/data">
            public/data directory of the repository
          </ExternalLink>
          . Some data files are imported from other places which may have different licenses, so
          please check the specific sources below for specific licensing information. Best practice
          is to cite both this website as well as the major sources for the data.
        </div>
      </DocsSection>

      <DocsSection title="Data Sources">
        <div>
          The data used in this application is sourced from various linguistic databases, including
          Glottolog, Ethnologue, and CLDR. This data is meant to be as public and freely available
          as possible so that all people can understand languages in context and make informed
          decisions about languages across the world.
        </div>
        <h3 style={{ margin: '1em 0em 0 0' }}>Input databases</h3>
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
          <ExternalLink href="https://www.ethnologue.com/" />
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

        <h3 style={{ margin: '1em 0em 0 0' }}>Data Fields</h3>
        <DocsCard title="IDs">
          The various language IDs (eg. ISO 3166 territory codes or language glottcodes) come from
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

function ScrollButton({ href, children }: { href: string; children: ReactNode }) {
  // Cannot use InternalLink because it wouldn't scroll to the section
  return (
    <a href={href} style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
      <button style={{ padding: '0.5em 1em' }}>{children}</button>
    </a>
  );
}

export default AboutPage;
