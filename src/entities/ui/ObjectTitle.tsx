import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { ObjectData } from '@entities/types/DataTypes';

type Props = {
  object: ObjectData;
  highlightSearchMatches?: boolean;
};

const ObjectTitle: React.FC<Props> = ({ object, highlightSearchMatches = true }) => {
  const { codeDisplay, nameDisplay, nameEndonym } = object;

  if (!highlightSearchMatches) {
    return (
      <>
        <strong>{nameDisplay}</strong>
        {nameEndonym && nameDisplay != nameEndonym && ' ' + nameEndonym} [{codeDisplay}]
      </>
    );
  }

  return (
    <>
      <strong>
        <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.NameDisplay} />
      </strong>{' '}
      {nameDisplay != nameEndonym && (
        <div style={{ display: 'inline-block' }}>
          {/* placed in its own div to prevent right-to-left names from breaking */}
          <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.NameEndonym} />
        </div>
      )}{' '}
      [
      <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Code} />]
    </>
  );
};

export default ObjectTitle;
