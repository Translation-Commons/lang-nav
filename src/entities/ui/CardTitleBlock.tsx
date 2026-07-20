import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { ObjectData } from '@entities/types/DataTypes';

import ObjectSubtitle from './ObjectSubtitle';

type Props = {
  object: ObjectData;
  showCode?: boolean;
  showEndonym?: boolean;
};

/**
 * Fixed-height identity block shared by every entity card. The title clamps to two lines so the
 * first data row starts at the same vertical position across sibling cards, the full name is
 * available on title-attr hover, and the code renders as a muted monospace [code] suffix. When a
 * card opts into an endonym, the subtitle slot reserves one line of height (min-h derived from its
 * 0.72rem font at 1.2 line-height) so the block stays the same height whether or not an endonym
 * exists, keeping first data rows aligned across sibling cards.
 */
const CardTitleBlock: React.FC<Props> = ({ object, showCode = true, showEndonym = false }) => {
  return (
    <div className="border-border mb-3 border-b pb-3">
      <div
        title={object.nameDisplay}
        className="line-clamp-2 min-h-[2.6rem] pr-5 text-[1.09rem] leading-[1.2] font-semibold tracking-[-0.015em]"
      >
        <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.NameDisplay} />
        {showCode && (
          <span className="text-muted-foreground ml-1 font-mono text-[0.72rem] font-normal whitespace-nowrap">
            [<ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Code} />]
          </span>
        )}
      </div>
      {showEndonym && (
        <ObjectSubtitle
          object={object}
          style={{
            fontSize: '0.72rem',
            lineHeight: 1.2,
            marginTop: '0.15rem',
            minHeight: '0.86rem',
          }}
        />
      )}
    </div>
  );
};

export default CardTitleBlock;
