import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import EntityFieldHighlightedByPageSearch from '@features/transforms/search/EntityFieldHighlightedByPageSearch';

import { getEntitySubtitle } from '@entities/lib/getEntityName';
import { EntityData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

type Props = {
  ent: EntityData;
  highlightSearchMatches?: boolean;
};

const EntitySubtitle: React.FC<Props> = ({ ent, highlightSearchMatches = true }) => {
  const { searchBy, searchString } = usePageParams();
  const entSubtitle = getEntitySubtitle(ent);

  if (!highlightSearchMatches) {
    return <SubtitleContainer>{entSubtitle}</SubtitleContainer>;
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
          aka <EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameAny} />
        </>
      );
    }
  }
  const subtitles = [entSubtitle, searchNamesSubtitle].filter(Boolean);

  return (
    <SubtitleContainer>
      <CommaSeparated limit={null}>{subtitles}</CommaSeparated>
    </SubtitleContainer>
  );
};

const SubtitleContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="text-(--color-text-secondary) text-sm italic mt-0 font-normal">{children}</div>
  );
};

export default EntitySubtitle;
