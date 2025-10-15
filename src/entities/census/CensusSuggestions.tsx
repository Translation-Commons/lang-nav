import HoverableObjectName from '@entities/ui/HoverableObjectName';
import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

const CensusSuggestions: React.FC = () => {
  const { censuses } = useDataContext();

  return (
    <div className="separatedButtonList">
      {['ca2021.1', 'ca2021.4', 'in2011c16.1', 'in2011c17.4'].map(
        (code) =>
          censuses[code] != null && (
            <HoverableObjectName key={code} object={censuses[code]} format="button" />
          ),
      )}
    </div>
  );
};

export default CensusSuggestions;
