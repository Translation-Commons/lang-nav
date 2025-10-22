import React from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';

import HoverableObjectName from '@entities/ui/HoverableObjectName';

const TerritorySuggestions: React.FC = () => {
  const { getTerritory } = useDataContext();

  return (
    <div className="separatedButtonList">
      {['US', 'MX', 'FR', 'RU', 'EG', 'CN'].map((code) => (
        <HoverableObjectName key={code} object={getTerritory(code)} format="button" />
      ))}
    </div>
  );
};
export default TerritorySuggestions;
