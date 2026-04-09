import { CopyIcon } from 'lucide-react';
import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import CreativeCommonsLicense from '@widgets/CreativeCommonsLicense';
import DocsCard from '@widgets/docs/DocsCard';
import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import InternalLink from '@features/params/InternalLink';

import ExternalLink from '@shared/ui/ExternalLink';

const TermsOfUsePage: React.FC = () => {
  const citation =
    'Nied, Conrad A. and Stewart, Jeannette. 2026. Language Navigator. Translation Commons. Accessed ' +
    new Date().toISOString().split('T')[0] +
    '. https://translation-commons.github.io/lang-nav/';

  return (
    <DocsPageContainer title="Terms of Use">
      This page summarizes the terms of use for the Language Navigator, including guidelines for
      citing data, using visualizations, and sharing code. Note that much of the website contains
      information passed on by other organizations which may have different terms. Please read these
      terms carefully to understand your rights and responsibilities when using the site and its
      content.
      <DocsSection title="Typical Use">
        <DocsCard title="Permitted Use">
          You are welcome to use Language Navigator for personal or academic purposes, such as:
          <ul style={{ margin: '0' }}>
            <li>browse and search the site</li>
            <li>read and reference the information</li>
            <li>use it for research, education, planning, or general informational purposes</li>
            <li>link to public pages</li>
            <li>use open-source materials according to their licenses</li>
            <li>export data for offline analysis</li>
          </ul>
        </DocsCard>
        <DocsCard title="Prohibited Use">
          You should not use Language Navigator in a way that causes harm to the site, its users, or
          the data it provides. This includes but is not limited to:
          <ul style={{ margin: '0' }}>
            <li>redistribute data without attribution to us and all original sources</li>
            <li>attempt to access non-public areas of the site</li>
            <li>misrepresent the source of the data or content</li>
            <li>violate any applicable laws or regulations</li>
          </ul>
        </DocsCard>
        <DocsCard title="Data Accuracy">
          We strive to provide accurate and up-to-date information, but we cannot guarantee the
          accuracy, completeness, or reliability of the data. The information on this site is
          provided for general informational purposes only and should not be used as the sole basis
          for any decision-making. Users are encouraged to verify information from multiple sources
          and to consult original sources when possible. Please let us know if you find any errors
          or have concerns about the data.
        </DocsCard>
      </DocsSection>
      <DocsSection title="Intellectual Property and Licensing">
        <DocsCard title="Data License">
          Great effort has been made to only show data that is as open and freely available as
          possible, but the data on this site is sourced from a variety of places with individual
          terms of use. Please check the specific sources for the data you are interested in for
          specific licensing information. Best practice is to cite both this website as well as the
          major sources for the data. We are working on providing explicit citations for each data
          type. For information about particular data sources see our page on{' '}
          <InternalLink page={LangNavPageName.DataSources}>Data Sources</InternalLink>.
        </DocsCard>
        <DocsCard
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
              Content License
              <CreativeCommonsLicense />
            </div>
          }
        >
          The data directly curated by Translation Commons as well as visualizations and other
          content are licensed under{' '}
          <ExternalLink href="https://creativecommons.org/licenses/by-sa/4.0/">
            Creative Commons Attribution-ShareAlike 4.0
          </ExternalLink>
          . This means you are free to share and adapt the content, even for commercial purposes, as
          long as you give appropriate credit, provide a link to the license, and indicate if
          changes were made.
        </DocsCard>
        <DocsCard title="Source Code License">
          The code for the Language Navigator is licensed under the{' '}
          <ExternalLink href="https://opensource.org/license/mit/">MIT License</ExternalLink>. This
          means you are free to use, modify, and distribute the code, provided that you include the
          original copyright notice and license in any copies or substantial portions of the
          software. If you are interested in using our components we would love to learn about how
          you would like to use it and we encourage you to reach out to us.
        </DocsCard>
        <DocsCard title="Source Code">
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
        </DocsCard>
        <DocsCard title="Icons">
          Icons used in this website are provided by{' '}
          <ExternalLink href="https://lucide.dev">Lucide</ExternalLink>, and are distributed under
          the ISC License. You can view the license{' '}
          <ExternalLink href="https://lucide.dev/license">here</ExternalLink>.
        </DocsCard>
      </DocsSection>
      <DocsSection title="Citing Language Navigator">
        <div>
          If you use Language Navigator in your research, publications, or projects, we ask that you
          cite it as follows:
        </div>
        <HoverableButton
          hoverContent="Click to copy citation"
          style={{
            margin: '1em',
            padding: '1em',
            display: 'flex',
            alignItems: 'center',
            textAlign: 'left',
          }}
          onClick={() => navigator.clipboard.writeText(citation)}
        >
          <div>{citation}</div>
          <CopyIcon />
        </HoverableButton>
      </DocsSection>
      <DocsSection title="Contact">
        <div>
          If you have any questions about sharing data, please contact us at{' '}
          <ExternalLink href="mailto:langnav-outreach@translationcommons.org">
            langnav-outreach@translationcommons.org
          </ExternalLink>
          .
        </div>
      </DocsSection>
    </DocsPageContainer>
  );
};

export default TermsOfUsePage;
