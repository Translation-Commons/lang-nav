import React, { PropsWithChildren, useMemo } from 'react';

type DataVizParams = {
  isFilterPanelOpen: boolean;
  toggleFilterPanel: () => void;
};

const DataVizParamsContext = React.createContext<DataVizParams | undefined>(undefined);

type ProviderProps = PropsWithChildren<{
  isFilterPanelOpen: boolean;
  toggleFilterPanel: () => void;
}>;

/**
 * These parameters control the state of the data visualization page. They do not persist across page reloads.
 * major parameters should be in the PageParamsProvider instead.
 *
 * * The filter panel is open and providing a function to toggle it.
 * * More to come
 */
const DataVizParamsProvider: React.FC<ProviderProps> = ({
  children,
  isFilterPanelOpen: isFilterPanelOpen,
  toggleFilterPanel: toggleFilterPanel,
}) => {
  const providerValue: DataVizParams = useMemo(
    () => ({
      isFilterPanelOpen,
      toggleFilterPanel,
    }),
    [isFilterPanelOpen, toggleFilterPanel],
  );

  return (
    <DataVizParamsContext.Provider value={providerValue}>{children}</DataVizParamsContext.Provider>
  );
};

export const useDataVizParams = (): DataVizParams => {
  const context = React.useContext(DataVizParamsContext);
  if (context) return context;
  return {
    isFilterPanelOpen: false,
    toggleFilterPanel: () => {},
  };
};

export default DataVizParamsProvider;
