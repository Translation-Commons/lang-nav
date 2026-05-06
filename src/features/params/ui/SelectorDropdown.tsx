import React from 'react';

import Dropdown from '@features/layers/dropdown/Dropdown';
import DropdownAnchor from '@features/layers/dropdown/DropdownAnchor';
import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';
import ZIndex from '@features/layers/ZIndex';

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
        <HoverCardProvider zIndex={ZIndex.HoverCardInDropdown}>
          <Dropdown
            aria-label="selector options"
            className="dropdown selector"
            containerRef={containerRef}
            isOpen={isOpen}
            offset={12}
            role="listbox"
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: 'min-content',
              borderRadius: '1em',
              backgroundColor: 'rgba(0,0,0,0)',
              maxHeight: '50vh',
              overflow: 'auto',
              paddingRight: '1em',
              direction: 'rtl',
              scrollbarWidth: 'thin',
            }}
          >
            {children}
          </Dropdown>
        </HoverCardProvider>
      </DropdownAnchor>
    </SelectorDisplayProvider>
  );
};
