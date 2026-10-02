import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';

import CountOfPeople from '@shared/ui/CountOfPeople';
import ExternalLink from '@shared/ui/ExternalLink';

import { getTechScopeLabel } from '@strings/TechnologyStrings';

import TechnologyConnections from './TechnologyConnections';
import type { TechnologyData } from './TechnologyTypes';

type Props = {
  tech: TechnologyData;
};

const TechnologyDetails: React.FC<Props> = ({ tech }) => {
  const {
    codeDisplay,
    nameDisplay,
    population,
    populationSource,
    languageSupportLastUpdated,
    languageSupportURL,
  } = tech;
  const languages = tech.languageSupport?.map((support) => support.lang).filter((l) => !!l) ?? [];

  return (
    <div className="Details">
      <DetailsSection title="Definition">
        {codeDisplay !== nameDisplay && (
          <DetailsField title="Short Name">{codeDisplay}</DetailsField>
        )}
        <DetailsField title="Full Name">{nameDisplay}</DetailsField>
        <DetailsField title="Scope">{getTechScopeLabel(tech.scope)}</DetailsField>
      </DetailsSection>

      {population && (
        <DetailsSection title="Population">
          <DetailsField title="Users">
            <CountOfPeople count={population} />
          </DetailsField>

          {populationSource && (
            <DetailsField title="Population Source">
              <EntityFieldDisplay ent={tech} field={Field.SourceForPopulation} />
            </DetailsField>
          )}
        </DetailsSection>
      )}
      {languages.length > 0 && (
        <DetailsSection title="Languages">
          <DetailsField title="Languages Supported">
            <HoverableEnumeration
              items={languages.map((lang) => (
                <HoverableEntityName key={lang.ID} ent={lang} />
              ))}
            />
          </DetailsField>

          {languageSupportLastUpdated && (
            <DetailsField title="Last Updated">
              {languageSupportLastUpdated.toLocaleDateString()}
            </DetailsField>
          )}
          {languageSupportURL && (
            <DetailsField title="Source URL">
              <ExternalLink href={languageSupportURL} showDomainOnly />
            </DetailsField>
          )}
        </DetailsSection>
      )}
      <TechnologyConnections tech={tech} />
    </div>
  );
};

export default TechnologyDetails;
