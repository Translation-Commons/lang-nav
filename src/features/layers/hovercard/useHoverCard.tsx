import { useContext } from 'react';

import HoverCardContext from './HoverCardContext';

const useHoverCard = () => {
  const context = useContext(HoverCardContext);
  if (!context) throw new Error('useHoverCard must be used within a HoverCardProvider');
  return context;
};

export default useHoverCard;
