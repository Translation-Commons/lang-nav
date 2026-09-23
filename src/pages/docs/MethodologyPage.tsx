import React from 'react';

import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

import LanguageTaxonomyTable from './LanguageTaxonomyTable';

const MethodologyPage: React.FC = () => {
  return (
    <DocsPageContainer title="Methodology">
      <div>
        Language Navigator aggregates a bunch of trusted resources but also must make judgments on
        how to best reconcile conflicting information. In order to collect every entry into
        comparable format, here are the protocols we follow.
      </div>
      <DocsSection title="Language Taxonomy">
        <div>
          It is useful to understand how language categories are related to each other, which
          languages and dialects they may encompass or groupings they are encompassed by. However,
          there is no definitive or universally agreed-upon classification, and different sources
          may present varying perspectives. For language navigator we have adopted a framework with
          more groupings than traditional classifications. See this table and compare between our
          framework, glottolog, and ISO standards.
        </div>
        {/* todo figure out how to efficiently include this */}
        <details>
          <summary>See taxonomy example of Serbian & Southeastern Huastec Nahuatl</summary>
          <LanguageTaxonomyTable />
        </details>
      </DocsSection>
    </DocsPageContainer>
  );
};

export default MethodologyPage;
