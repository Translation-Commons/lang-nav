import React from 'react';

import { usePageParams } from '@widgets/PageParamsProvider';
import { SearchableField } from '@widgets/PageParamTypes';

import { getObjectSubtitle } from '@entities/lib/getObjectName';
import { ObjectData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

import { ObjectFieldHighlightedByPageSearch } from './ObjectField';

type Props = {
  object: ObjectData;
  highlightSearchMatches?: boolean;
};

const ObjectTitle: React.FC<Props> = ({ object, highlightSearchMatches = false }) => {
  const { searchBy, searchString } = usePageParams();
  const objectSubtitle = getObjectSubtitle(object);
  const { codeDisplay, nameDisplay, nameEndonym } = object;

  if (!highlightSearchMatches) {
    return (
      <>
        <strong>{nameDisplay}</strong>
        {nameEndonym && nameDisplay != nameEndonym && ' ' + nameEndonym} [{codeDisplay}]
        {objectSubtitle != null && <div className="subtitle">{objectSubtitle}</div>}
      </>
    );
  }

  // Add to the subtitle are if we are searching by all names and we have to find the value by searching a new name
  let searchNamesSubtitle = null;
  if (searchBy === SearchableField.AllNames) {
    const lowercaseSearchString = searchString.toLowerCase();
    if (
      !object.nameDisplay.toLowerCase().includes(lowercaseSearchString) &&
      !object.nameEndonym?.toLowerCase().includes(lowercaseSearchString)
    ) {
      searchNamesSubtitle = (
        <>
          aka{' '}
          <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.AllNames} />
        </>
      );
    }
  }
  const subtitles = [objectSubtitle, searchNamesSubtitle].filter(Boolean);

  return (
    <>
      <strong>
        <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.EngName} />
      </strong>{' '}
      {nameDisplay != nameEndonym && (
        <div style={{ display: 'inline-block' }}>
          {/* placed in its own div to prevent right-to-left names from breaking */}
          <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Endonym} />
        </div>
      )}{' '}
      [
      <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Code} />]
      {subtitles.length > 0 && (
        <div className="subtitle">
          <CommaSeparated limit={null}>{subtitles}</CommaSeparated>
        </div>
      )}
    </>
  );
};

export default ObjectTitle;
