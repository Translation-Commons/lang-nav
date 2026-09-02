import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import EntityFieldHighlightedByPageSearch from '@features/transforms/search/EntityFieldHighlightedByPageSearch';

import { EntityData } from '@entities/types/DataTypes';

type Props = {
  ent: EntityData;
  highlightSearchMatches?: boolean;
};

const EntityTitle: React.FC<Props> = ({ ent, highlightSearchMatches = true }) => {
  const { codeDisplay, nameDisplay } = ent;

  if (!highlightSearchMatches) {
    return (
      <>
        <strong>{nameDisplay}</strong> <Code>{codeDisplay}</Code>
      </>
    );
  }

  return (
    <>
      <strong>
        <EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameDisplay} />
      </strong>{' '}
      <Code>
        <EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.Code} />
      </Code>
    </>
  );
};

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-mono text-muted-foreground font-thin text-[0.8em]">{children}</span>
);

export default EntityTitle;
