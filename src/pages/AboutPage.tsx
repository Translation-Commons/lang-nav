import React, { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { getNewURL } from '../controls/PageParamsContext';
import { LanguageSchema } from '../types/LanguageTypes';
import { PageParamsOptional } from '../types/PageParamTypes';

import CreativeCommonsLicense from './CreativeCommonsLicense';

const AboutPage: React.FC = () => {
  return (
    <PageContainer>
      <LangNavTitle />
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
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

      <Section id="motivation" title="Motivation">
        <dl>
          <DictionaryEntry term="Free and Open">
            The Language Navigator is built on the belief that language data should be accessible to
            everyone. We aim to provide a free and open-source tool that allows users to explore and
            understand the world&apos;s languages without barriers. We want to empower people to
            learn about languages, their relationships, and their relevance in today&apos;s digital
            world.
          </DictionaryEntry>
          <DictionaryEntry term="Actionable Insights">
            The Language Navigator is designed to provide actionable insights into the world of
            languages. We aim to help people make informed decisions about language use--whether in
            spoken context or digital communication. We also acknowledge that many of the languages
            represented here are endangered, or while thriving in spoken form, remain unsupported on
            digital platforms. Depending on your goals, this insight might inspire support
            efforts—or influence strategic prioritization.
          </DictionaryEntry>
          <DictionaryEntry term="Inclusive">
            The Language Navigator highlights not only widely spoken languages but also those
            recognized by specific communities, even if they lack global consensus. Where data is
            disputed or incomplete, we aim for transparency. Users can see{' '}
            <DataPageLink params={{ languageSchema: LanguageSchema.Inclusive }}>
              all attested languages
            </DataPageLink>{' '}
            or choose to follow specific standards like{' '}
            <DataPageLink params={{ languageSchema: LanguageSchema.ISO }}>ISO 639-3/5</DataPageLink>
            ,{' '}
            <DataPageLink params={{ languageSchema: LanguageSchema.Glottolog }}>
              Glottolog
            </DataPageLink>
            , <DataPageLink params={{ languageSchema: LanguageSchema.UNESCO }}>UNESCO</DataPageLink>
            , or <DataPageLink params={{ languageSchema: LanguageSchema.CLDR }}>CLDR</DataPageLink>.
          </DictionaryEntry>
        </dl>
      </Section>

      <Section id="contributors" title="Contributors">
        <p>
          The Language Navigator is a project by the{' '}
          <a href="https://translationcommons.org">Translation Commons</a> team, with this website
          spearheaded by <a href="https://www.linkedin.com/in/conrad-nied-60993917">Conrad Nied</a>.
          It is developed and maintained by a group of dedicated volunteers who are passionate about
          language and technology.
        </p>
      </Section>

      <Section id="acknowledgments" title="Acknowledgments">
        <p>
          We would like to thank the following organizations for their contributions to this
          project:
        </p>
        <dl>
          <DictionaryEntry term={<a href="https://home.unicode.org/">The Unicode Consortium</a>}>
            For providing the Unicode standard and the Common Locale Data Repository (CLDR), which
            serves as a foundation for the language data used in this application.
          </DictionaryEntry>
          <DictionaryEntry
            term={
              <a href="https://hlt.bme.hu/en/projects/lingvit">Digital Language Vitality Project</a>
            }
          >
            For their work cataloging language vitality and providing great insights on which data
            to use for this website.
          </DictionaryEntry>
          <DictionaryEntry term={<a href="https://www.ethnologue.com/">Ethnologue</a>}>
            For their comprehensive database of world languages, which serves as a valuable resource
            for this project.
          </DictionaryEntry>
          <DictionaryEntry term={<a href="https://www.glottolog.org/">Glottolog</a>}>
            For their work in cataloging the world&apos;s languages and providing a reliable
            reference for language classification.
          </DictionaryEntry>
          <DictionaryEntry
            term={<a href="https://www.unesco.org/">United Nations: UNESCO, UNStats, and UNData</a>}
          >
            For their efforts in promoting linguistic diversity and providing valuable data on
            language use worldwide.
          </DictionaryEntry>
          <DictionaryEntry term="You, the viewer">
            For exploring and using this tool. Your curiosity and interest in languages is what
            drives this project forward.
          </DictionaryEntry>
        </dl>
      </Section>

      <Section id="contact" title="Contact">
        <p>
          If you have any questions, suggestions, or feedback about the Language Navigator, please{' '}
          <a href="https://github.com/Translation-Commons/lang-nav/issues">
            file an issue on Github
          </a>
          . We are always looking for ways to improve the tool and enhance the quality of the
          language data we provide.
        </p>
      </Section>

      <Section id="license" title="License">
        <p>
          The code for the Language Navigator is licensed under the{' '}
          <a href="https://opensource.org/license/mit/">MIT License</a>. This means you are free to
          use, modify, and distribute the code, provided that you include the original copyright
          notice and license in any copies or substantial portions of the software.
        </p>
        <p>
          The proprietary language data, visualizations, and other content are licensed under{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">
            Creative Commons Attribution-ShareAlike 4.0
          </a>
          . This means you are free to share and adapt the content, even for commercial purposes, as
          long as you give appropriate credit, provide a link to the license, and indicate if
          changes were made.
        </p>
        <CreativeCommonsLicense />
        <p>
          Icons used in this website are provided by{' '}
          <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer">
            Lucide
          </a>
          , and are distributed under the ISC License. You can view the license{' '}
          <a href="https://lucide.dev/license" target="_blank" rel="noopener noreferrer">
            here
          </a>
          .
        </p>
        <p>
          The source code is available in a{' '}
          <a href="https://github.com/Translation-Commons/lang-nav">Github repository</a>. The data
          files are available in the{' '}
          <a href="https://github.com/Translation-Commons/lang-nav/tree/master/public/data">
            public/data directory of the repository
          </a>
          . Some data files are imported from other places which may have different licenses, so
          please check the specific sources below for specific licensing information. Best practice
          is to cite both this website as well as the major sources for the data.
        </p>
      </Section>

      <Section id="data-sources" title="Data Sources">
        <p>
          The data used in this application is sourced from various linguistic databases, including
          Glottolog, Ethnologue, and CLDR. This data is meant to be as public and freely available
          as possible so that all people can understand languages in context and make informed
          decisions about languages across the world.
        </p>
        <h3>Input databases</h3>
        <dl>
          <DictionaryEntry term="Manually collected from Censuses and Academic Papers">
            The Language Navigator team has manually collected population and recognition data from
            various government censuses and academic papers. Sometimes, source websites were no
            longer accessible but data was retrieved using the internet archive&apos;s{' '}
            <a href="https://web.archive.org/">Wayback Machine</a>.
          </DictionaryEntry>
          <DictionaryEntry term="Unicode & CLDR">
            <a href="https://home.unicode.org/">The Unicode Consortium</a> provides the Unicode
            standard for how writing systems are encoded for use on electronic devices and{' '}
            <a href="https://cldr.unicode.org/">the Common Locale Data Repository (CLDR)</a>.We
            initially bootstrapped much of the data from CLDR - which itself catalogs much of the
            world&apos;s languages in order to provide keyboard and user-interface support. It also
            provides much of the data for the ISO standards{' '}
            <a href="https://iso639-3.sil.org/">ISO 639-3</a>.
          </DictionaryEntry>
          <DictionaryEntry term="Glottolog">
            <a href="https://glottolog.org/">Glottolog</a> is a comprehensive catalog of the
            world&apos;s languages, dialects, and language families. It provides an extensive
            taxonomy of languages and dialects in language families, information about the
            endangerment and location of languages, and a large bibliography for the languages.{' '}
            <strong>Citation:</strong> Hammarström, Harald & Forkel, Robert & Haspelmath, Martin &
            Bank, Sebastian. 2024. Glottolog 5.1. Leipzig: Max Planck Institute for Evolutionary
            Anthropology. https://doi.org/10.5281/zenodo.10804357 (Available online at
            http://glottolog.org, Accessed on 2024-10-29.)
          </DictionaryEntry>
          <DictionaryEntry term="Ethnologue">
            <a href="https://www.ethnologue.com/">Ethnologue</a> is a reference work cataloging all
            of the world&apos;s known living languages. It provides information about the number of
            speakers, language families, and geographical distribution of languages. Ethnologue
            contains much more complete academic citations for similar information provided by this
            website. <strong>Citation:</strong> Eberhard, David M., Gary F. Simons, and Charles D.
            Fennig (eds.). 2025. Ethnologue: Languages of the World. Twenty-eighth edition. Dallas,
            Texas: SIL International. Online version: https://www.ethnologue.com/
          </DictionaryEntry>
          <DictionaryEntry term="United Nations: UNESCO, UNStats, and UNData">
            <a href="https://www.unesco.org/">
              United Nations Educational, Scientific and Cultural Organization (UNESCO)
            </a>{' '}
            is a specialized agency of the United Nations that promotes international collaboration
            in education, science, and culture. They have built{' '}
            <a href="https://en.wal.unesco.org/">World Atlas of Languages (WAL)</a> -- a similar
            database that is focused specifically on contributions from UN member state delegates.
            Additionally,{' '}
            <a href="https://unstats.un.org/unsd/demographic-social/census/">UNStats</a> and{' '}
            <a href="https://data.un.org/Default.aspx">UNData</a> provide census data like
            population and literacy.
          </DictionaryEntry>
        </dl>

        <h3>Data Fields</h3>
        <dl>
          <DictionaryEntry term="IDs">
            The various language IDs (eg. ISO 3166 territory codes or language glottcodes) come from
            their respective original database (ISO, Glottolog, CLDR). When an object has multiple
            identities, it has been manually matched by the Language Navigator team to a single
            entity. For instance, English is represented in CLDR by the ISO 639-1 code{' '}
            <DataPageLink params={{ languageSchema: LanguageSchema.CLDR, objectID: 'eng' }}>
              en
            </DataPageLink>
            , the ISO 639-3 code{' '}
            <DataPageLink params={{ languageSchema: LanguageSchema.ISO, objectID: 'eng' }}>
              eng
            </DataPageLink>
            , and the Glottocode{' '}
            <DataPageLink params={{ languageSchema: LanguageSchema.Glottolog, objectID: 'eng' }}>
              stan1293
            </DataPageLink>
            .
          </DictionaryEntry>
          <DictionaryEntry term="Names">
            The names are sourced from the original databases, with some manual adjustments to
            ensure consistency and clarity. When swapping between different language definitions the
            language names will update to match the one provided by the source for that definition.
            For example, Chinese as a macrolanguage is called &quot;Classical-Middle-Modern
            Sinitic&quot; in Glottolog.
          </DictionaryEntry>
          <DictionaryEntry term="Population">
            The population data comes from many sources. Some estimates are directly imported from
            government censuses or academic papers -- sometimes we had to interpret the intended
            language (eg. is &quot;Malay&quot; referring to standard Malay, vernacular Malay, or
            Malay as a macrolanguage). Some come from secondary sources like Ethnologue or CLDR. A
            few estimates, especially for regional locales, are approximations based on the related
            data.
          </DictionaryEntry>
        </dl>
      </Section>
    </PageContainer>
  );
};

function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div style={{ margin: '2em auto', maxWidth: '800px', textAlign: 'start' }}>{children}</div>
  );
}

function ScrollButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
      <button style={{ padding: '0.5em 1em' }}>{children}</button>
    </a>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div className="section" id={id} style={{ marginBottom: '2em' }}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function DictionaryEntry({ term, children }: { term: ReactNode; children: ReactNode }) {
  return (
    <>
      <dt style={{ fontWeight: 600 }}>{term}</dt>
      <dd>{children}</dd>
    </>
  );
}

function LangNavTitle() {
  return (
    <div
      className="logo"
      style={{
        alignItems: 'center',
        display: 'flex',
        fontSize: '2em',
        padding: '0.25em',
        marginBottom: '0.25em',
        gap: '0.5em',
      }}
    >
      <img src="LangNavLogo.svg" width="120px" height="60px" alt="LangNav Logo" />
      <span>
        <strong>Lang</strong>uage <strong>Nav</strong>igator
      </span>
    </div>
  );
}

function DataPageLink({ params, children }: PropsWithChildren<{ params: PageParamsOptional }>) {
  return (
    <Link to={'/data' + getNewURL(params)} style={{ textDecoration: 'none' }}>
      {children}
    </Link>
  );
}

export default AboutPage;
