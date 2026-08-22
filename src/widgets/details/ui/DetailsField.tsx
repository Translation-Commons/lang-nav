import { InfoIcon } from 'lucide-react';
import React, { PropsWithChildren, ReactNode } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

type Props = PropsWithChildren<{
  title: ReactNode;
  description?: ReactNode;
  endContent?: ReactNode;
  indent?: number;
}>;

const DetailsField: React.FC<Props> = ({
  children,
  title,
  description,
  endContent,
  indent = 0,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        // End content drops to its own line rather than spilling out of a narrow container
        flexWrap: 'wrap',
        marginLeft: indent * 2 + 'em',
        minWidth: 0,
      }}
    >
      {/* Prefers 200px so titles line up, but yields in containers too narrow for it */}
      <div style={{ minWidth: 'min(200px, 100%)' }}>
        <div style={{ fontWeight: 600, marginRight: '0.25em', display: 'inline-flex' }}>
          {title}
          {description && (
            <Hoverable hoverContent={description}>
              <InfoIcon size="1em" display="block" aria-label="More information" />
            </Hoverable>
          )}
          <span style={{ fontWeight: 'normal' }}>:</span>
        </div>
        {children}
      </div>
      {endContent}
    </div>
  );
};

export default DetailsField;
