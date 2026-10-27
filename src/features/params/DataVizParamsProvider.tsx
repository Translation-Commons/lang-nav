import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react';

import { Axis, AxisScale } from '@features/transforms/scales/AxisScale';

type DataVizParams = {
  isFilterPanelOpen: boolean;
  toggleFilterPanel: () => void;
  scale?: Partial<Record<Axis, AxisScale>>;
  setScale?: (axis: Axis, scale: AxisScale) => void;
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
  isFilterPanelOpen,
  toggleFilterPanel,
}) => {
  const [scaleByAxis, setScaleByAxis] = useState<Partial<Record<Axis, AxisScale>>>({});
  const setScale = useCallback(
    (axis: Axis, scale: AxisScale) => {
      setScaleByAxis((prev) => ({ ...prev, [axis]: scale }));
    },
    [setScaleByAxis],
  );

  const providerValue: DataVizParams = useMemo(
    () => ({
      isFilterPanelOpen,
      toggleFilterPanel,
      scale: scaleByAxis,
      setScale,
    }),
    [isFilterPanelOpen, toggleFilterPanel, scaleByAxis, setScale],
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
