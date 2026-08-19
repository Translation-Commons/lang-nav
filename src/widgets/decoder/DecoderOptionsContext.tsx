import React, { useState } from 'react';

export enum DecoderDirection {
  NamesToCodes,
  CodesToNames,
}

type DecoderOptionsContextType = {
  includeMacroCodes: boolean;
  direction: DecoderDirection;
  setDirection: React.Dispatch<React.SetStateAction<DecoderDirection>>;
  setIncludeMacroCodes: React.Dispatch<React.SetStateAction<boolean>>;
};

const DecoderOptionsContext = React.createContext<DecoderOptionsContextType>({
  includeMacroCodes: false,
  direction: DecoderDirection.NamesToCodes,
  setDirection: () => {},
  setIncludeMacroCodes: () => {},
});

export const useDecoderOptionsContext = () => React.useContext(DecoderOptionsContext);

export const DecoderOptionsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [direction, setDirection] = useState(DecoderDirection.NamesToCodes);
  const [includeMacroCodes, setIncludeMacroCodes] = useState<boolean>(false);

  return (
    <DecoderOptionsContext.Provider
      value={{ includeMacroCodes, direction, setDirection, setIncludeMacroCodes }}
    >
      {children}
    </DecoderOptionsContext.Provider>
  );
};

export default DecoderOptionsContext;
