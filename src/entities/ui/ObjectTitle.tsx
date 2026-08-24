import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { EntityData } from '@entities/types/DataTypes';

type Props = {
  ent: EntityData;
  highlightSearchMatches?: boolean;
};

const ObjectTitle: React.FC<Props> = ({ ent, highlightSearchMatches = true }) => {
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
        <ObjectFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameDisplay} />
      </strong>{' '}
      [
      <ObjectFieldHighlightedByPageSearch ent={ent} field={SearchableField.Code} />]
    </>
  );
};

export default ObjectTitle;
