import React from 'react';

import { DocCard, DocsCardGrid, PageContainer, Section } from '@widgets/DocsComponents';

const DocsPage: React.FC = () => {
  return (
    <PageContainer title="Documentation Hub">
      <main style={{ display: 'flex', gap: '1em', flexDirection: 'column' }}>
        This page brings together the main documents and reference materials for LangNav, including
        project information, privacy details, data transparency notes, and open-source resources.
        <Section title="Core Pages">
          Key information about LangNav, the project’s goals, and how the site operates.
          <DocsCardGrid>
            <DocCard title="About LangNav" href="about">
              Learn about the project’s purpose, values, and the kinds of language information
              LangNav aims to make easier to explore.
            </DocCard>
            <DocCard title="Privacy Policy" href="privacy-policy">
              Read how LangNav handles analytics, cookies, and any information collected when people
              use the site.
            </DocCard>
            <DocCard title="Terms of Use" href="terms-of-use" isDisabled={true}>
              A future page describing acceptable use, attribution, and general terms for using the
              site and its data.
            </DocCard>
          </DocsCardGrid>
        </Section>
        <Section title="Data & Methodology">
          Information about where LangNav’s data comes from, how it is combined, and what
          limitations users should keep in mind.
          <DocsCardGrid>
            <DocCard title="Data Sources" href="data-sources" isDisabled={true}>
              An overview of major sources used by LangNav, such as ISO, CLDR, Glottolog, UNESCO,
              Wikipedia, and public demographic datasets.
            </DocCard>
            <DocCard title="Methodology" href="methodology" isDisabled={true}>
              How LangNav reconciles multiple standards, names, classifications, and population
              estimates into a usable reference experience.
            </DocCard>
            <DocCard title="Known Limitations" href="known-limitations" isDisabled={true}>
              A transparent explanation of where data may be incomplete, disputed, approximate, or
              dependent on source-specific definitions.
            </DocCard>
          </DocsCardGrid>
        </Section>
        <Section title="Open Source">
          Technical and contribution resources for people who want to inspect the codebase or help
          improve the project.
          <DocsCardGrid>
            <DocCard
              title="GitHub Repository"
              href="https://github.com/Translation-Commons/lang-nav"
              external={true}
            >
              Browse the open-source codebase, report issues, or contribute to the project on
              GitHub.
            </DocCard>
            <DocCard
              title="Contribution Guide"
              href="https://github.com/Translation-Commons/lang-nav/blob/master/docs/contributing.md"
              external={true}
            >
              Guidance for contributors who want to suggest fixes, improve data, or help build
              features.
            </DocCard>
            <DocCard
              title="License"
              href="https://github.com/Translation-Commons/lang-nav/blob/master/LICENSE"
              external={true}
            >
              The license pertaining to the project&apos;s code and interactive elements (not the
              data).
            </DocCard>
            <DocCard
              title="Repository Documentation"
              href="https://github.com/Translation-Commons/lang-nav/tree/master/docs"
              external={true}
            >
              Additional technical notes, setup instructions, and supporting documents available in
              the repository.
            </DocCard>
          </DocsCardGrid>
        </Section>
      </main>
    </PageContainer>
  );
};

export default DocsPage;
