import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import DocsCard from '@widgets/docs/DocsCard';
import DocsCardGrid from '@widgets/docs/DocsCardGrid';
import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

const AboutPage: React.FC = () => {
  return (
    <DocsPageContainer
      title={
        <>
          About <strong>Lang</strong>uage <strong>Nav</strong>igator
        </>
      }
      showDocsLink={false}
    >
      This page brings together the main documents and reference materials for LangNav, including
      project information, privacy details, data transparency notes, and open-source resources.
      <DocsSection title="Core Pages">
        Key information about LangNav, the project’s goals, and how the site operates.
        <DocsCardGrid>
          <DocsCard title="LangNav Team" page={LangNavPageName.Team}>
            An introduction to the project, its mission, and the team behind it.
          </DocsCard>
          <DocsCard title="Privacy Policy" page={LangNavPageName.PrivacyPolicy}>
            Read how LangNav handles analytics, cookies, and any information collected when people
            use the site.
          </DocsCard>
          <DocsCard title="Terms of Use" page={LangNavPageName.TermsOfUse}>
            A page describing acceptable use, attribution, and general terms for using the site and
            its data.
          </DocsCard>
        </DocsCardGrid>
      </DocsSection>
      <DocsSection title="Data & Methodology">
        Information about where LangNav’s data comes from, how it is combined, and what limitations
        users should keep in mind.
        <DocsCardGrid>
          <DocsCard title="Data Coverage" page={LangNavPageName.DataCoverage}>
            An overview of the types of information included in LangNav, such as each entity and
            each field, including how many entities have data for each field.
          </DocsCard>
          <DocsCard title="Data Sources" page={LangNavPageName.DataSources}>
            An overview of major sources used by LangNav, such as ISO, CLDR, Glottolog, UNESCO,
            Wikipedia, and public demographic datasets.
          </DocsCard>
          <DocsCard title="Methodology" href="/methodology" isDisabled={true}>
            How LangNav reconciles multiple standards, names, classifications, and population
            estimates into a usable reference experience.
          </DocsCard>
          <DocsCard title="Known Limitations" href="/known-limitations" isDisabled={true}>
            A transparent explanation of where data may be incomplete, disputed, approximate, or
            dependent on source-specific definitions.
          </DocsCard>
        </DocsCardGrid>
      </DocsSection>
      <DocsSection title="Development">
        Technical and contribution resources for people who want to inspect the codebase or help
        improve the project.
        <DocsCardGrid>
          <DocsCard
            title="GitHub Repository"
            href="https://github.com/Translation-Commons/lang-nav"
          >
            Browse the open-source codebase, report issues, or contribute to the project on GitHub.
          </DocsCard>
          <DocsCard title="Code Style" page={LangNavPageName.CodeStyle}>
            Learn about the coding standards and best practices followed in the LangNav project.
          </DocsCard>
          <DocsCard
            title="Contribution Guide"
            href="https://github.com/Translation-Commons/lang-nav/blob/master/docs/contributing.md"
          >
            Guidance for contributors who want to suggest fixes, improve data, or help build
            features.
          </DocsCard>
          <DocsCard
            title="License"
            href="https://github.com/Translation-Commons/lang-nav/blob/master/LICENSE"
          >
            The license pertaining to the project&apos;s code and interactive elements (not the
            data).
          </DocsCard>
          <DocsCard
            title="Repository Documentation"
            href="https://github.com/Translation-Commons/lang-nav/tree/master/docs"
          >
            Additional technical notes, setup instructions, and supporting documents available in
            the repository.
          </DocsCard>
        </DocsCardGrid>
      </DocsSection>
    </DocsPageContainer>
  );
};

export default AboutPage;
