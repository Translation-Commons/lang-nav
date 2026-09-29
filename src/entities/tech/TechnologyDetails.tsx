import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';

import CountOfPeople from '@shared/ui/CountOfPeople';

import TechnologyConnections from './TechnologyConnections';
import { TechnologyData } from './TechnologyTypes';

type Props = {
  tech: TechnologyData;
};

const TechnologyDetails: React.FC<Props> = ({ tech }) => {
  const { codeDisplay, nameDisplay, population, populationSource } = tech;

  return (
    <div className="Details">
      <DetailsSection title="Definition">
        {codeDisplay !== nameDisplay && (
          <DetailsField title="Short Name">{codeDisplay}</DetailsField>
        )}
        <DetailsField title="Full Name">{nameDisplay}</DetailsField>
      </DetailsSection>
      <DetailsSection title="Attributes">
        {population && (
          <DetailsField title="Population">
            <CountOfPeople count={population} />
          </DetailsField>
        )}
        {populationSource && (
          <DetailsField title="Population Source">
            <EntityFieldDisplay ent={tech} field={Field.SourceForPopulation} />
          </DetailsField>
        )}
      </DetailsSection>
      <TechnologyConnections tech={tech} />
    </div>
  );
};

export default TechnologyDetails;
