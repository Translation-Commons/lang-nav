import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

type HoverCardData = {
  content: React.ReactNode;
  x: number;
  y: number;
  visible: boolean;
};

type HoverCardContextType = {
  showHoverCard: (content: React.ReactNode, x: number, y: number) => void;
  hideHoverCard: () => void;
  onMouseLeaveTriggeringElement: () => void; // Callback when the mouse leaves the triggering element
};

const HoverCardContext = createContext<HoverCardContextType | undefined>(undefined);

export const HoverCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hoverCard, setHoverCard] = useState<HoverCardData>({
    content: null,
    x: 0,
    y: 0,
    visible: false,
  });
  const [leftTriggeringElement, setLeftTriggeringElement] = useState<boolean>(false);

  const showHoverCard = (content: React.ReactNode, x: number, y: number) => {
    setLeftTriggeringElement(false);
    setHoverCard({ content, x, y, visible: true });
  };

  const hideHoverCard = () => {
    setHoverCard((prev) => ({ ...prev, visible: false }));
  };

  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseLeaveTriggeringElement = () => {
    setLeftTriggeringElement(true);
  };

  // Listen for mouse movements, if the hovercard is visible and the mouse moves too far away from it, hide it
  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!hoverCard.visible || !cardRef.current || !leftTriggeringElement) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;

      // Check if the mouse is outside the hover card's bounding box
      if (x < rect.left - 10 || x > rect.right + 10 || y < rect.top - 10 || y > rect.bottom + 10) {
        hideHoverCard();
      }
    }

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoverCard.visible, hideHoverCard, leftTriggeringElement]);

  // Adjust hover card position to fit within the viewport
  useLayoutEffect(() => {
    if (!cardRef.current || !hoverCard.visible) return;

    const card = cardRef.current;

    const { offsetWidth, offsetHeight } = card;

    let newX = hoverCard.x + 10;
    let newY = hoverCard.y + 10;

    if (newX + offsetWidth > window.innerWidth) {
      newX = window.innerWidth - offsetWidth - 10;
    }

    if (newY + offsetHeight > window.innerHeight) {
      newY = window.innerHeight - offsetHeight - 10;
    }

    if (newX !== hoverCard.x || newY !== hoverCard.y) {
      setHoverCard((prev) => ({ ...prev, x: newX - 10, y: newY - 10 }));
    }
  }, [hoverCard.x, hoverCard.y, hoverCard.visible]);

  return (
    <HoverCardContext.Provider
      value={{ showHoverCard, hideHoverCard, onMouseLeaveTriggeringElement }}
    >
      {children}
      <HoverCardContext.Provider
        value={{
          showHoverCard: () => null,
          hideHoverCard: () => null,
          onMouseLeaveTriggeringElement: () => null,
        }}
      >
        {/** Prevent hovercard propagation */}
        <div
          ref={cardRef}
          className="HoverCard"
          style={{
            background: 'var(--color-background)',
            borderRadius: '0.5em',
            padding: '0.8em 1em',
            margin: '0.5em',
            position: 'fixed',
            border: '1px solid var(--color-button-secondary)',
            boxShadow: '0 4px 12px var(--color-shadow)',
            zIndex: 9999,
            maxWidth: '30%',
            textAlign: 'start',
            transition: 'opacity 0.6s, top 0.3s, left 0.3s',
            opacity: hoverCard.visible ? 1 : 0,
            pointerEvents: hoverCard.visible ? 'auto' : 'none',
            top: hoverCard.y + 5,
            left: hoverCard.x + 5,
          }}
        >
          {hoverCard.content}
        </div>
      </HoverCardContext.Provider>
    </HoverCardContext.Provider>
  );
};

export const useHoverCard = () => {
  const context = useContext(HoverCardContext);
  if (!context) throw new Error('useHoverCard must be used within a HoverCardProvider');
  return context;
};
