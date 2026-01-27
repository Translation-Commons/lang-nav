import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { getObjectSubtitle } from '@entities/lib/getObjectName';
import { ObjectData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

type Props = {
  object: ObjectData;
  highlightSearchMatches?: boolean;
  style?: React.CSSProperties;
};

const ObjectSubtitle: React.FC<Props> = ({ object, highlightSearchMatches = false, style }) => {
  const { searchBy, searchString } = usePageParams();
  const objectSubtitle = getObjectSubtitle(object);

  if (!highlightSearchMatches) {
    return <SubtitleContainer style={style}>{objectSubtitle}</SubtitleContainer>;
  }

  // Add to the subtitle are if we are searching by all names and we have to find the value by searching a new name
  let searchNamesSubtitle = null;
  if (searchBy === SearchableField.NameAny) {
    const lowercaseSearchString = searchString.toLowerCase();
    if (
      !object.nameDisplay.toLowerCase().includes(lowercaseSearchString) &&
      !object.nameEndonym?.toLowerCase().includes(lowercaseSearchString)
    ) {
      searchNamesSubtitle = (
        <>
          aka <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.NameAny} />
        </>
      );
    }
  }
  const subtitles = [objectSubtitle, searchNamesSubtitle].filter(Boolean);

  return (
    <SubtitleContainer style={style}>
      <CommaSeparated limit={null}>{subtitles}</CommaSeparated>
    </SubtitleContainer>
  );
};

const SubtitleContainer: React.FC<React.PropsWithChildren<{ style?: React.CSSProperties }>> = ({
  children,
  style,
}) => {
  return (
    <div
      style={{
        color: 'var(--color-text-secondary)',
        fontSize: '0.6em',
        fontStyle: 'italic',
        fontWeight: 'normal',
        marginTop: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default ObjectSubtitle;
