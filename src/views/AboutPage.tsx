import React from 'react';

import { getNewURL } from '../controls/PageParamsContext';
import CreativeCommonsLicense from '../CreativeCommonsLicense';
import { LanguageSchema } from '../types/LanguageTypes';

const AboutPage: React.FC = () => {
  return (
    <div className="AboutPage">
      <h1>About</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <a href="#motivation">
          <button>Motivation</button>
        </a>
        <a href="#contributors">
          <button>Contributors</button>
        </a>
        <a href="#acknowledgments">
          <button>Acknowledgments</button>
        </a>
        <a href="#contact">
          <button>Contact</button>
        </a>
        <a href="#license">
          <button>License</button>
        </a>
        <a href="#data-sources">
          <button>Data Sources</button>
        </a>
      </div>
      <p>
        The <strong>Lang</strong>uage <strong>Navi</strong>gator is a tool designed to help people
        explore and understand the relationships between different languages. It provides a
        user-friendly interface for visualizing language families, dialects, and other linguistic
        features and how they are situated across the globe.
      </p>

      <div className="section" id="motivation">
        <h2>Motivation</h2>
        <dl>
          <dt>Free and Open</dt>
          <dd>
            The Language Navigator is built on the belief that language data should be accessible to
            everyone. We aim to provide a free and open-source tool that allows users to explore and
            understand the world&apos;s languages without barriers. We want to empower people to
            learn about languages, their relationships, and their relevance in today&apos;s digital
            world.
          </dd>
          <dt>Actionable Insights</dt>
          <dd>
            The Language Navigator is designed to provide actionable insights into the world of
            languages. We aim to help people make informed decisions about language use--whether in
            spoken context or digital communication. We also acknowledge that many of the languages
            represented here are endangered, or while thriving in spoken form, remain unsupported on
            digital platforms. Depending on your goals, this insight might inspire support
            efforts—or influence strategic prioritization.
          </dd>
          <dt>Inclusive</dt>
          <dd>
            The Language Navigator highlights not only widely spoken languages but also those
            recognized by specific communities, even if they lack global consensus. Where data is
            disputed or incomplete, we aim for transparency. Users can see{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.Inclusive })}>
              all attested languages
            </a>{' '}
            or choose to follow specific standards like{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.ISO })}>ISO 639-3/5</a>,{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.Glottolog })}>Glottolog</a>,{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.UNESCO })}>UNESCO</a>, or{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.CLDR })}>CLDR</a>.
          </dd>
        </dl>
      </div>

      <div className="section" id="contributors">
        <h2>Contributors</h2>
        <p>
          The Language Navigator is a project by the{' '}
          <a href="https://translationcommons.org">Translation Commons</a> team, with this website
          spearheaded by <a href="https://www.linkedin.com/in/conrad-nied-60993917">Conrad Nied</a>.
          It is developed and maintained by a group of dedicated volunteers who are passionate about
          language and technology.
        </p>
      </div>
      <div className="section" id="acknowledgments">
        <h2>Acknowledgments</h2>
        <p>
          We would like to thank the following organizations for their contributions to this
          project:
        </p>
        <dl>
          <dt>
            <a href="https://home.unicode.org/">The Unicode Consortium</a>
          </dt>
          <dd>
            For providing the Unicode standard and the Common Locale Data Repository (CLDR), which
            serves as a foundation for the language data used in this application.
          </dd>
          <dt>
            <a href="https://hlt.bme.hu/en/projects/lingvit">Digital Language Vitality Project</a>
          </dt>
          <dd>
            For their work cataloging language vitality and providing great insights on which data
            to use for this website.
          </dd>
          <dt>You, the viewer</dt>
          <dd>
            For exploring and using this tool. Your curiosity and interest in languages is what
            drives this project forward.
          </dd>
        </dl>
      </div>
      <div className="section" id="contact">
        <h2>Contact</h2>
        <p>
          If you have any questions, suggestions, or feedback about the Language Navigator, please{' '}
          <a href="https://github.com/Translation-Commons/lang-nav/issues">
            file an issue on Github
          </a>
          . We are always looking for ways to improve the tool and enhance the quality of the
          language data we provide.
        </p>
      </div>

      <div className="section" id="license">
        <h2>License</h2>
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
        <CreativeCommonsLicense />
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
      </div>

      <div className="section" id="data-sources">
        <h2>Data Sources</h2>
        <p>
          The data used in this application is sourced from various linguistic databases, including
          Glottolog, Ethnologue, and CLDR. This data is meant to be as public and freely available
          as possible so that all people can understand languages in context and make informed
          decisions about languages across the world.
        </p>
        <h3>Input databases</h3>
        <dl>
          <dt>Manually collected from Censuses and Academic Papers</dt>
          <dd>
            The Language Navigator team has manually collected population and recognition data from
            various government censuses and academic papers. Sometimes, source websites were no
            longer accessible but data was retrieved using the internet archive&apos;s{' '}
            <a href="https://web.archive.org/">Wayback Machine</a>.
          </dd>
          <dt>Unicode & CLDR</dt>
          <dd>
            <a href="https://home.unicode.org/">The Unicode Consortium</a> provides the Unicode
            standard for how writing systems are encoded for use on electronic devices and{' '}
            <a href="https://cldr.unicode.org/">the Common Locale Data Repository (CLDR)</a>.We
            initially bootstrapped much of the data from CLDR - which itself catalogs much of the
            world&apos;s languages in order to provide keyboard and user-interface support. It also
            provides much of the data for the ISO standards{' '}
            <a href="https://iso639-3.sil.org/">ISO 639-3</a>.
          </dd>
          <dt>Glottolog</dt>
          <dd>
            <a href="https://glottolog.org/">Glottolog</a> is a comprehensive catalog of the
            world&apos;s languages, dialects, and language families. It provides an extensive
            taxonomy of languages and dialects in language families, information about the
            endangerment and location of languages, and a large bibliography for the languages.{' '}
            <strong>Citation:</strong> Hammarström, Harald & Forkel, Robert & Haspelmath, Martin &
            Bank, Sebastian. 2024. Glottolog 5.1. Leipzig: Max Planck Institute for Evolutionary
            Anthropology. https://doi.org/10.5281/zenodo.10804357 (Available online at
            http://glottolog.org, Accessed on 2024-10-29.)
          </dd>
          <dt>Ethnologue</dt>
          <dd>
            <a href="https://www.ethnologue.com/">Ethnologue</a> is a reference work cataloging all
            of the world&apos;s known living languages. It provides information about the number of
            speakers, language families, and geographical distribution of languages. Ethnologue
            contains much more complete academic citations for similar information provided by this
            website. <strong>Citation:</strong> Eberhard, David M., Gary F. Simons, and Charles D.
            Fennig (eds.). 2025. Ethnologue: Languages of the World. Twenty-eighth edition. Dallas,
            Texas: SIL International. Online version: https://www.ethnologue.com/
          </dd>
          <dt>United Nations: UNESCO, UNStats, and UNData</dt>
          <dd>
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
          </dd>
        </dl>

        <h3>Data Fields</h3>
        <dl>
          <dt>IDs</dt>
          <dd>
            The various language IDs (eg. ISO 3166 territory codes or language glottcodes) come from
            their respective original database (ISO, Glottolog, CLDR). When an object has multiple
            identities, it has been manually matched by the Language Navigator team to a single
            entity. For instance, English is represented in CLDR by the ISO 639-1 code{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.CLDR, objectID: 'eng' })}>en</a>,
            the ISO 639-3 code{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.ISO, objectID: 'eng' })}>eng</a>,
            and the Glottocode{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.Glottolog, objectID: 'eng' })}>
              stan1293
            </a>
            .
          </dd>
          <dt>Names</dt>
          <dd>
            The names are sourced from the original databases, with some manual adjustments to
            ensure consistency and clarity. When swapping between different language definitions the
            language names will update to match the one provided by the source for that definition.
            For example, Chinese as a macrolanguage is called &quot;Classical-Middle-Modern
            Sinitic&quot; in Glottolog.
          </dd>
          <dt>Population</dt>
          <dd>
            The population data comes from many sources. Some estimates are directly imported from
            government censuses or academic papers -- sometimes we had to interpret the intended
            language (eg. is &quot;Malay&quot; referring to standard Malay, vernacular Malay, or
            Malay as a macrolanguage). Some come from secondary sources like Ethnologue or CLDR. A
            few estimates, especially for regional locales, are approximations based on the related
            data.
          </dd>
        </dl>
      </div>
    </div>
  );
};

export default AboutPage;
