import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { getEntitySubtitle } from '@entities/lib/getEntityName';
import { EntityData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

type Props = {
  ent: EntityData;
  highlightSearchMatches?: boolean;
  style?: React.CSSProperties;
};

const ObjectSubtitle: React.FC<Props> = ({ ent, highlightSearchMatches = true, style }) => {
  const { searchBy, searchString } = usePageParams();
  const entSubtitle = getEntitySubtitle(ent);

  if (!highlightSearchMatches) {
    return <SubtitleContainer style={style}>{entSubtitle}</SubtitleContainer>;
  }

  // Add to the subtitle are if we are searching by all names and we have to find the value by searching a new name
  let searchNamesSubtitle = null;
  if (searchBy === SearchableField.NameAny) {
    const lowercaseSearchString = searchString.toLowerCase();
    if (
      !ent.nameDisplay.toLowerCase().includes(lowercaseSearchString) &&
      !ent.nameEndonym?.toLowerCase().includes(lowercaseSearchString)
    ) {
      searchNamesSubtitle = (
        <>
          aka <ObjectFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameAny} />
        </>
      );
    }
  }
  const subtitles = [entSubtitle, searchNamesSubtitle].filter(Boolean);

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
