import { FilterIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '../generic/HoverableButton';

type Props = {
  navbar: React.ReactNode;
  sidebar: React.ReactNode;
  footer: React.ReactNode;
};

const PageLayout: React.FC<React.PropsWithChildren<Props>> = ({
  navbar,
  sidebar,
  footer,
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div>
      {navbar}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside
          style={{
            width: isOpen ? '16em' : '0',
            overflowY: 'auto',
            borderRight: '2px solid var(--color-button-border)',
            transition: 'width 0.3s ease-in-out',
          }}
        >
          <div style={{ padding: '.5em', width: '15em' }}>{sidebar}</div>
          <div className="selector rounded">
            <HoverableButton
              hoverContent={
                isOpen ? 'Close filters & view options panel' : 'Open filters & view options panel'
              }
              className={isOpen ? 'selected' : ''}
              onClick={() => setIsOpen((open) => !open)}
              style={{
                position: 'fixed',
                top: '50%',
                left: isOpen ? '16em' : '1.5em',
                transform: 'translateX(-50%) translateY(-50%)', // move it to the center of its position
                zIndex: 1000,
                transition: 'left 0.3s ease-in-out',
              }}
              aria-label={
                isOpen ? 'Close filters & view options panel' : 'Open filters & view options panel'
              }
            >
              <FilterIcon size="1em" display="block" />
            </HoverableButton>
          </div>
        </aside>
        <main style={{ flex: 1, padding: '1em', overflow: 'auto' }}>{children}</main>
      </div>
      {footer}
    </div>
  );
};

export default PageLayout;
