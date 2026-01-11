import { InfoIcon } from 'lucide-react';
import React, { PropsWithChildren, ReactNode } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

type Props = PropsWithChildren<{
  title: ReactNode;
  description?: ReactNode;
  endContent?: ReactNode;
}>;

const DetailsField: React.FC<Props> = ({ children, title, description, endContent }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ minWidth: '200px' }}>
        <div style={{ fontWeight: 600, marginRight: '0.25em', display: 'inline-flex' }}>
          {title}
          {description && (
            <Hoverable hoverContent={description}>
              <InfoIcon size="1em" display="block" aria-label="More information" />
            </Hoverable>
          )}
          {/* Most usages are manually adding a colon after the title, before that is phased out we are
          adding it back in when we add a description */}
          {description && <>:</>}
        </div>
        {children}
      </div>
      {endContent}
    </div>
  );
};

export default DetailsField;
