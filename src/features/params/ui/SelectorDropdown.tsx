import React from 'react';

import Dropdown from '@features/layers/dropdown/Dropdown';
import DropdownAnchor from '@features/layers/dropdown/DropdownAnchor';

import { SelectorDisplay, SelectorDisplayProvider } from './SelectorDisplayContext';

type Props = {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
};

export const SelectorDropdown: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  containerRef,
  isOpen,
}) => {
  return (
    <SelectorDisplayProvider display={SelectorDisplay.Dropdown}>
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
          className="dropdown selector"
          containerRef={containerRef}
          isOpen={isOpen}
          offset={12}
          role="listbox"
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 'fit-content',
          }}
        >
          {children}
        </Dropdown>
      </DropdownAnchor>
    </SelectorDisplayProvider>
  );
};
