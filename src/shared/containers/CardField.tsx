import React, { PropsWithChildren } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import Field from '@features/transforms/fields/Field';
import FieldIcon from '@features/transforms/fields/FieldIcon';

type Props = PropsWithChildren<{
  title: string;
  field: Field;
  description: React.ReactNode;
}>;

/**
 * A single data row on an entity card. A fixed icon gutter (top-aligned to the first line of the
 * value) sits beside the value, which lives in its own column so long values wrap cleanly instead
 * of flowing back under the icon.
 */
const CardField: React.FC<Props> = ({ children, title, field, description }) => {
  return (
    <div className="mb-2 grid grid-cols-[1rem_1fr] items-start gap-x-2">
      <span
        aria-label={title + ': ' + description}
        className="text-muted-foreground mt-[0.15rem] inline-flex"
      >
        <Hoverable
          hoverContent={
            <>
              <strong>{title}</strong>: {description}
            </>
          }
        >
          <FieldIcon field={field} />
        </Hoverable>
      </span>
      <div className="min-w-0 text-[0.8rem] leading-snug">{children}</div>
    </div>
  );
};

export default CardField;
