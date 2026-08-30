import React, { PropsWithChildren } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import FieldIcon from '@features/transforms/fields/FieldIcon';

import { getFieldDescription, getFieldLabel } from '@strings/FieldLabelStrings';

type Props = PropsWithChildren<{
  title?: string;
  field: Field;
  description?: React.ReactNode;
}>;

const CardField: React.FC<Props> = ({ children, title, field, description }) => {
  const { entType } = usePageParams();
  title ??= getFieldLabel(field, entType);
  description ??= getFieldDescription(field, entType);

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em', gap: '0.5em' }}>
      <span
        aria-label={(title ?? field) + ': ' + description}
        style={{ display: 'inline-flex', verticalAlign: 'middle' }}
      >
        <Hoverable
          hoverContent={
            <>
              <strong>{title ?? field}</strong>: {description}
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
