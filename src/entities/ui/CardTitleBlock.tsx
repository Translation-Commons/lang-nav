import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { ObjectData } from '@entities/types/DataTypes';

import { cn } from '@shared/lib/utils';

import ObjectSubtitle from './ObjectSubtitle';

type Props = {
  object: ObjectData;
  showCode?: boolean;
  showEndonym?: boolean;
};

/**
 * Identity block shared by every entity card. The title never truncates: long names wrap to as many
 * lines as they need and the code renders as a muted monospace [code] suffix. The block is a flex
 * column packed to the top, so the endonym (when shown) sits directly beneath the title with no gap.
 * A min-height sized to the common case (a two-line title, plus an endonym line for entities that
 * show one) reserves a uniform header height across sibling cards of the same entity type, so their
 * first data row starts at the same vertical position; the slack sits at the BOTTOM (between the
 * content and the divider). Titles that genuinely need three or more lines grow past the min-height,
 * pushing their stats down naturally.
 */
const CardTitleBlock: React.FC<Props> = ({ object, showCode = true, showEndonym = false }) => {
  return (
    <div
      className={cn(
        'border-border mb-3 flex flex-col justify-start border-b pb-3',
        // Reserve two title lines; endonym cards also reserve the subtitle line beneath it.
        showEndonym ? 'min-h-[4.4rem]' : 'min-h-[3.4rem]',
      )}
    >
      <div
        title={object.nameDisplay}
        className="pr-5 text-[1.09rem] leading-[1.2] font-semibold tracking-[-0.015em]"
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
          style={{ fontSize: '0.72rem', lineHeight: 1.2, marginTop: '0.15rem' }}
        />
      )}
    </div>
  );
};

export default CardTitleBlock;
