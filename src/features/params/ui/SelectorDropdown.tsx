import React from 'react';

import Dropdown from '@features/layers/dropdown/Dropdown';
import DropdownAnchor from '@features/layers/dropdown/DropdownAnchor';

type Props = {
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

export const SelectorDropdown: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  containerRef,
}) => {
  return (
    <DropdownAnchor
      style={{
        width: 0,
        height: 0,
        margin: 0,
        padding: 0,
        flex: '0 0 auto',
        display: 'inline-block',
      }}
    >
      <Dropdown
        aria-label="selector options"
        className="dropdown"
        containerRef={containerRef}
        isOpen={true}
        offset={12}
        role="listbox"
        style={{
          alignItems: 'start',
          display: 'flex',
          flexDirection: 'column',
          width: 'fit-content',
          backgroundColor: 'var(--color-background)',
          borderRadius: '1em',
          maxHeight: '21em',
          overflowY: 'auto',
        }}
      >
        {children}
      </Dropdown>
    </DropdownAnchor>
  );
};
