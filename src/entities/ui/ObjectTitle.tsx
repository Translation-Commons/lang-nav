import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { ObjectData } from '@entities/types/DataTypes';

type Props = {
  object: ObjectData;
  highlightSearchMatches?: boolean;
};

const ObjectTitle: React.FC<Props> = ({ object, highlightSearchMatches = true }) => {
  const { codeDisplay, nameDisplay } = object;

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
        <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.NameDisplay} />
      </strong>{' '}
      [
      <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Code} />]
    </>
  );
};

export default ObjectTitle;
