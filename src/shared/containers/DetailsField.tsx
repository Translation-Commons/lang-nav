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
      className="flex flex-wrap items-center justify-between gap-x-2"
      style={{ marginLeft: indent * 2 + 'em' }}
    >
      <div className="min-w-0">
        <span className="mr-1 inline-flex items-center font-semibold">
          {title}
          {description && (
            <Hoverable hoverContent={description}>
              <InfoIcon size="1em" display="block" aria-label="More information" />
            </Hoverable>
          )}
          <span className="font-normal">:</span>
        </span>{' '}
        {children}
      </div>
      {endContent}
    </div>
  );
};

export default DetailsField;
