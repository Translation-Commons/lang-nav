import React, { PropsWithChildren } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import Field from '@features/transforms/fields/Field';
import FieldIcon from '@features/transforms/fields/FieldIcon';

type Props = PropsWithChildren<{
  title: string;
  field: Field;
  description: React.ReactNode;
}>;

const CardField: React.FC<Props> = ({ children, title, field, description }) => {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span aria-label={title + ': ' + description} className="inline-flex align-middle">
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
      {children}
    </div>
  );
};

export default CardField;
