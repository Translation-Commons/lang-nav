import React from 'react';

import { getNewURL } from '../controls/PageParamsContext';
import { LanguageSchema } from '../types/LanguageTypes';

const AboutPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'left' }}>
      <h1>About</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <a href="#contributors">
          <button>Contributors</button>
        </a>
        <a href="#motivation">
          <button>Motivation</button>
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

      <div className="section" id="contributors">
        <h2>Contributors</h2>
        <p>
          The Language Navigator is a project by the{' '}
          <a href="https://translationcommons.org">Translation Commons</a> team, with this website
          spearheaded by <a href="https://www.linkedin.com/in/conrad-nied-60993917">Conrad Nied</a>.
          It is developed and maintained by a group of dedicated volunteers who are passionate about
          language and technology.
        </p>
        <p>
          This project is open-source and welcomes contributions from the community. If you have any
          questions or suggestions, feel free to reach out! The source code is available on Github
          at{' '}
          <a href="https://github.com/Translation-Commons/lang-nav">
            https://github.com/Translation-Commons/lang-nav
          </a>
          . Feel free to file new issues there, or if you are confident in directly filing pull
          requests to update the Typescript code or the data files.
        </p>
      </div>

      <div className="section" id="motivation">
        <h2>Motivations</h2>
        <dl>
          <dt>Free and Open</dt>
          <dd>
            The Language Navigator is a free and open-source project. We believe that language data
            should be accessible to everyone, and we are committed to making this tool available to
            all.
          </dd>
          <dt>Actionable Insights</dt>
          <dd>
            The Language Navigator is designed to provide actionable insights into the world of
            languages. We aim to help people make informed decisions about language use in both
            spoken context as well as written or internet contexts. Unfortunately, this acknowledges
            that many languages shown here are dying or even if they are thriving in person, they
            are not used in computing devices. Depending on the aim of the reader that could
            motivate them to improve support or to wait and focus efforts on other languages that
            are more likely to be used.
          </dd>
          <dt>Inclusive</dt>
          <dd>
            The Language Navigator aims to show the diversity of languages and dialects around the
            world -- including not just languages that are spoken by small communities, but also
            ones that are not univesally recognized. When information is contested -- we will try to
            show transparent information about the limitations of the data. When viewing data you
            can toggle which Definition of Language to follow:{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.Inclusive })}>
              allow any attested languages
            </a>
            , or follow the perspective of{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.ISO })}>ISO 639-3/5</a>,{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.Glottolog })}>Glottolog</a>,{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.UNESCO })}>UNESCO</a>, or{' '}
            <a href={getNewURL({ languageSchema: LanguageSchema.CLDR })}>CLDR</a>.
          </dd>
        </dl>
      </div>

      <div className="section" id="data-sources">
        <h2>Data Sources</h2>
        <p>
          The data used in this application is sourced from various linguistic databases, including
          Glottolog, Ethnologue, and CLDR. The raw input data is saved in files in the github
          repository{' '}
          <a href="https://github.com/Translation-Commons/lang-nav/tree/master/public/data">
            https://github.com/Translation-Commons/lang-nav/tree/master/public/data
          </a>
          . This data is meant to be as public and freely available as possible so that all people
          can understand languages in context and make informed decisions about languages across the
          world.
        </p>
        <dl>
          <dt>Unicode & CLDR</dt>
          <dd>
            <a href="https://home.unicode.org/">The Unicode Consortium</a> provides the Unicode
            standard for how writing systems are encoded for use on electronic devices and{' '}
            <a href="https://cldr.unicode.org/">the Common Locale Data Repository (CLDR)</a>. Much
            of the initial data was bootstraped from CLDR - which itself catalogs much of the worlds
            languages in order to provide keyboard and user-interface support. It also provides much
            of the data for the ISO standards <a href="https://iso639-3.sil.org/">ISO 639-3</a>.
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
            in education, science, and culture. We have partnered with them to build the next
            version of the <a href="https://en.wal.unesco.org/">World Atlas of Languages (WAL)</a>{' '}
            -- a similar database that is focused specifically on contributions from UN member state
            delegates. Additionally,{' '}
            <a href="https://unstats.un.org/unsd/demographic-social/census/">UNStats</a> and{' '}
            <a href="https://data.un.org/Default.aspx">UNData</a> provide census data like
            population and literacy.
          </dd>
        </dl>
      </div>
    </div>
  );
};

export default AboutPage;
