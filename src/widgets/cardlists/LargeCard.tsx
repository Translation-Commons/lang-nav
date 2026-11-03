import React, { ComponentPropsWithoutRef, PropsWithChildren } from 'react';

import { cn } from '@shared/lib/utils';

type Props = PropsWithChildren<ComponentPropsWithoutRef<'div'> & { selected?: boolean }>;

const LargeCard: React.FC<Props> = ({ children, selected, ...props }) => {
  return (
    <div
      className={cn(
        'group relative border-2 border-transparent rounded-lg shadow-lg p-4 text-start text-xs hover:border-(--color-button-hover) data-selected:border-(--color-button-primary)',
        props.onClick && 'cursor-pointer',
      )}
      data-selected={selected}
      data-testid="large-card"
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
};

export default LargeCard;
