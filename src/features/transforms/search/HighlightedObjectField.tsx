import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import Highlightable from '@shared/ui/Highlightable';

import getSearchableField from './getSearchableField';

interface HighlightedObjectFieldProps {
  object: ObjectData;
  field: SearchableField;
  query: string;
  showOriginalName?: boolean;
}

const HighlightedObjectField: React.FC<HighlightedObjectFieldProps> = ({
  object,
  field,
  query,
  showOriginalName,
}) => {
  const searchResult = getSearchableField(object, field, query);
  if (showOriginalName && object.nameDisplay !== searchResult)
    return (
      <>
        {object.nameDisplay}{' '}
        <Deemphasized>
          (<Highlightable text={searchResult} searchPattern={query} />)
        </Deemphasized>
      </>
    );
  return <Highlightable text={searchResult} searchPattern={query} />;
};

export default HighlightedObjectField;
