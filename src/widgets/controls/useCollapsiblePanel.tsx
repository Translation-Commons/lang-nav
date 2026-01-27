import React from 'react';

const useCollapsiblePanel = (defaultWidth: number) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [panelWidth, setPanelWidth] = React.useState(defaultWidth); // but will change to pixels on resize

  // Placeholder for future implementation
  return { isOpen, setIsOpen, panelWidth, setPanelWidth };
};

export default useCollapsiblePanel;
