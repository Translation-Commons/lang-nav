import React from 'react';

import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

import { LanguageScope } from '@entities/language/LanguageTypes';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

import { getLanguageScopeDescription, getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

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
          may present varying perspectives. For Language Navigator, we have adopted a framework with
          more groupings than traditional classifications so we can accommodate various linguistic
          perspectives.
        </div>
        <div>
          {Object.values(LanguageScope)
            .filter((scope) => typeof scope === 'number')
            .map((scope, i) => (
              <div key={scope}>
                <div>
                  <strong>
                    {i + 1}. {getLanguageScopeLabel(scope)}
                  </strong>
                </div>
                <div className="ml-6">{getLanguageScopeDescription(scope)}</div>
              </div>
            ))}
        </div>
        <div>
          <em>
            See this table and compare between our framework, glottolog, and ISO standards for
            Serbian (the bibliographic code) & Southeastern Huastec Nahuatl
          </em>
          <ContainErrorsAndSuspense>
            <LanguageTaxonomyTable />
          </ContainErrorsAndSuspense>
        </div>
      </DocsSection>
    </DocsPageContainer>
  );
};

export default MethodologyPage;
