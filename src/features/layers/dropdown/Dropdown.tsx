import React from 'react';
import { createPortal } from 'react-dom';

import { useDropdownAnchor } from './DropdownAnchorContext';

type Alignment = 'start' | 'center' | 'end';

type Props = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement> & {
    align?: Alignment;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    isOpen: boolean;
    offset?: number;
  }
>;

const VIEWPORT_PADDING = 8;

const Dropdown: React.FC<Props> = ({
  align = 'start',
  children,
  className,
  containerRef,
  isOpen,
  offset = 10,
  style,
  ...rest
}) => {
  const anchorRef = useDropdownAnchor();
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = React.useState(false);
  const [position, setPosition] = React.useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });

  const setDropdownNode = React.useCallback(
    (node: HTMLDivElement | null) => {
      dropdownRef.current = node;
      if (containerRef) {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [containerRef],
  );

  const updatePosition = React.useCallback(() => {
    if (!anchorRef.current || !dropdownRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();

    let left = anchorRect.left;
    if (align === 'center') {
      left = anchorRect.left + anchorRect.width / 2 - dropdownRect.width / 2;
    } else if (align === 'end') {
      left = anchorRect.right - dropdownRect.width;
    }

    let top = anchorRect.bottom + offset;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + dropdownRect.width > viewportWidth - VIEWPORT_PADDING) {
      left = Math.max(VIEWPORT_PADDING, viewportWidth - dropdownRect.width - VIEWPORT_PADDING);
    }
    if (left < VIEWPORT_PADDING) {
      left = VIEWPORT_PADDING;
    }

    const dropdownBottom = top + dropdownRect.height;
    if (dropdownBottom > viewportHeight - VIEWPORT_PADDING) {
      const aboveTop = anchorRect.top - dropdownRect.height - offset;
      if (aboveTop >= VIEWPORT_PADDING) {
        top = aboveTop;
      } else {
        top = Math.max(VIEWPORT_PADDING, viewportHeight - dropdownRect.height - VIEWPORT_PADDING);
      }
    }

    setPosition({ left, top });
    setReady(true);
  }, [align, anchorRef, offset]);

  React.useLayoutEffect(() => {
    if (!isOpen) {
      setReady(false);
      return;
    }
    updatePosition();
  }, [isOpen, updatePosition, children]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handlePositionChange = () => updatePosition();

    window.addEventListener('resize', handlePositionChange);
    window.addEventListener('scroll', handlePositionChange, true);

    const observers: ResizeObserver[] = [];
    const canObserve = typeof ResizeObserver !== 'undefined';

    if (canObserve && anchorRef.current) {
      const observer = new ResizeObserver(handlePositionChange);
      observer.observe(anchorRef.current);
      observers.push(observer);
    }

    if (canObserve && dropdownRef.current) {
      const observer = new ResizeObserver(handlePositionChange);
      observer.observe(dropdownRef.current);
      observers.push(observer);
    }

    return () => {
      window.removeEventListener('resize', handlePositionChange);
      window.removeEventListener('scroll', handlePositionChange, true);
      observers.forEach((observer) => observer.disconnect());
    };
  }, [anchorRef, isOpen, updatePosition]);

  if (!isOpen || typeof document === 'undefined' || !anchorRef.current) return null;

  return createPortal(
    <div
      {...rest}
      className={className}
      ref={setDropdownNode}
      style={{
        position: 'fixed',
        left: ready ? position.left : -9999,
        top: ready ? position.top : -9999,
        zIndex: 1000,
        pointerEvents: 'auto',
        ...style,
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

export default Dropdown;
