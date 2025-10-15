import HoverableObjectName from '@entities/ui/HoverableObjectName';
import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

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
