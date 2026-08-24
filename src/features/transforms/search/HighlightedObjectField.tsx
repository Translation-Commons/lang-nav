import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';

import { EntityData } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import Highlightable from '@shared/ui/Highlightable';

import getSearchableField from './getSearchableField';

interface HighlightedObjectFieldProps {
  ent: EntityData;
  field: SearchableField;
  query: string;
  showOriginalName?: boolean;
}

const HighlightedObjectField: React.FC<HighlightedObjectFieldProps> = ({
  ent,
  field,
  query,
  showOriginalName,
}) => {
  const searchResult = getSearchableField(ent, field, query);
  if (showOriginalName && ent.nameDisplay !== searchResult && searchResult) {
    return (
      <>
        {ent.nameDisplay}{' '}
        <Deemphasized>
          (<Highlightable text={searchResult} searchPattern={query} />)
        </Deemphasized>
      </>
    );
  }
  return <Highlightable text={searchResult || ent.nameDisplay} searchPattern={query} />;
};

export default HighlightedObjectField;
