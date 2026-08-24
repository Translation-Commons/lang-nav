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
        <strong>{nameDisplay}</strong> [{codeDisplay}]
      </>
    );
  }

  return (
    <>
      <strong>
        <EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameDisplay} />
      </strong>{' '}
      [
      <EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.Code} />]
    </>
  );
};

export default EntityTitle;
