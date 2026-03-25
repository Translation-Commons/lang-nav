import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import DocsCard from '@widgets/docs/DocsCard';
import DocsCardGrid from '@widgets/docs/DocsCardGrid';
import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

import InternalLink from '@features/params/InternalLink';

import { LanguageSource } from '@entities/language/LanguageTypes';

import ExternalLink from '@shared/ui/ExternalLink';

const TeamPage: React.FC = () => {
  return (
    <DocsPageContainer title="The LangNav Team">
      <div>
        The <strong>Lang</strong>uage <strong>Nav</strong>igator team came together in March 2025
        with the shared goal of making language data more accessible for everyone and to help
        provide the insights they need to make informed decisions about language use in the world.
        We are a group of volunteers with a passion for language and technology and we are dedicated
        to create a tool that helps people explore and understand the world&apos;s languages in a
        more intuitive and engaging way.
      </div>
      <a
        href="https://translationcommons.org"
        style={{ margin: '0 auto' }}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://translationcommons.org/wp-content/uploads/2022/07/TC-logo.png"
          alt="Translation Commons Logo"
          style={{ width: '400px' }}
        />
      </a>
      <DocsSection title="Translation Commons">
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

      <DocsSection title="Guiding Principles">
        When we started this project we noticed specific gaps in the availability and accessibility
        of language data. We developed these guiding principles to help us focus on our approach in
        collecting, curating, and presenting this data.
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

      <DocsSection title="Acknowledgments">
        <div>
          We would like to thank the following organizations for their direct contributions to this
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
          <DocsCard
            title="United Nations Educational, Scientific and Cultural Organization (UNESCO)"
            href="https://www.unesco.org/"
          >
            For their efforts in reconciling language data from member states and the expert
            committee for the World Atlas of Languages (WAL) and providing guidance for the early
            stages of this project.
          </DocsCard>
          <DocsCard title="Data Providers">
            For contributing data to this project, see the{' '}
            <InternalLink page={LangNavPageName.DataSources}>Data Sources</InternalLink> page for a
            full list.
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
    </DocsPageContainer>
  );
};

export default TeamPage;
