import React from 'react';

export enum SelectorDisplay {
  Dropdown = 'dropdown', // Formatting is still off for these
  InlineDropdown = 'inlineDropdown', // Used to be inline with text
  ButtonGroup = 'buttonGroup', // Unsure if we want to keep this
  ButtonList = 'buttonList',
}

export const SelectorDisplayContext = React.createContext<{
  display: SelectorDisplay;
  setDisplay: React.Dispatch<React.SetStateAction<SelectorDisplay>>;
}>({
  display: SelectorDisplay.Dropdown,
  setDisplay: () => {},
});

export const SelectorDisplayProvider: React.FC<
  React.PropsWithChildren<{ display: SelectorDisplay }>
> = ({ display: defaultDisplay, children }) => {
  const [display, setDisplay] = React.useState<SelectorDisplay>(defaultDisplay);

  return (
    <SelectorDisplayContext.Provider value={{ display, setDisplay }}>
      {children}
    </SelectorDisplayContext.Provider>
  );
};

export const useSelectorDisplay = (): {
  display: SelectorDisplay;
  setDisplay: React.Dispatch<React.SetStateAction<SelectorDisplay>>;
} => {
  return React.useContext(SelectorDisplayContext);
};
