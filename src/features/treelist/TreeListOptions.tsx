import React from 'react';

interface TreeListOptions {
  allExpanded: boolean;
  showInfoButton: boolean;
  showPopulation: boolean;
  showObjectIDs: boolean;
  setAllExpanded: (value: boolean) => void;
  setShowInfoButton: (value: boolean) => void;
  setShowPopulation: (value: boolean) => void;
  setShowObjectIDs: (value: boolean) => void;
}
const TreeListOptionsContext = React.createContext<TreeListOptions>({
  allExpanded: false,
  showInfoButton: true,
  showPopulation: false,
  showObjectIDs: false,
  setAllExpanded: () => {},
  setShowInfoButton: () => {},
  setShowPopulation: () => {},
  setShowObjectIDs: () => {},
});

export const TreeListOptionsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [allExpanded, setAllExpanded] = React.useState(false);
  const [showInfoButton, setShowInfoButton] = React.useState(true);
  const [showPopulation, setShowPopulation] = React.useState(false);
  const [showObjectIDs, setShowObjectIDs] = React.useState(false);

  const value = {
    allExpanded,
    showInfoButton,
    showPopulation,
    showObjectIDs,
    setAllExpanded,
    setShowInfoButton,
    setShowPopulation,
    setShowObjectIDs,
  };

  return (
    <TreeListOptionsContext.Provider value={value}>{children}</TreeListOptionsContext.Provider>
  );
};

export function useTreeListOptionsContext(): TreeListOptions {
  const context = React.useContext(TreeListOptionsContext);
  return context;
}

export function TreeListOptionsSelectors() {
  const {
    allExpanded,
    showInfoButton,
    showPopulation,
    showObjectIDs,
    setAllExpanded,
    setShowInfoButton,
    setShowPopulation,
    setShowObjectIDs,
  } = useTreeListOptionsContext();

  return (
    <div className="TreeListOptions">
      <label>
        <input
          type="checkbox"
          checked={allExpanded}
          onChange={(e) => setAllExpanded(e.target.checked)}
        />
        Expand All
      </label>
      <label>
        <input
          type="checkbox"
          checked={showInfoButton}
          onChange={(e) => setShowInfoButton(e.target.checked)}
        />
        Show Info Button
      </label>
      <label>
        <input
          type="checkbox"
          checked={showPopulation}
          onChange={(e) => setShowPopulation(e.target.checked)}
        />
        Show Population
      </label>
      <label>
        <input
          type="checkbox"
          checked={showObjectIDs}
          onChange={(e) => setShowObjectIDs(e.target.checked)}
        />
        Show Object IDs
      </label>
    </div>
  );
}
