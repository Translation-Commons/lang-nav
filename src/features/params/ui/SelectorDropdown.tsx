import React from 'react';

type Props = {
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

export const SelectorDropdown: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  containerRef,
}) => {
  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <div
        className="dropdown"
        role="listbox"
        style={{
          alignItems: 'start',
          position: 'absolute',
          display: 'flex',
          left: '0px',
          flexDirection: 'column',
          width: 'fit-content',
          zIndex: 100,
          marginTop: '1em', // relative to the middle of the selector
          backgroundColor: 'var(--color-background)',
          borderRadius: '1em',
          maxHeight: '21em',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};
