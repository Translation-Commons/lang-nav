import { createContext } from 'react';

type HoverCardContextType = {
  showHoverCard: (content: React.ReactNode, x: number, y: number) => void;
  hideHoverCard: () => void;
  onMouseLeaveTriggeringElement: () => void; // Callback when the mouse leaves the triggering element
};

const HoverCardContext = createContext<HoverCardContextType | undefined>(undefined);

export default HoverCardContext;
