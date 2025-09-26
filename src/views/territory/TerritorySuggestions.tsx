import React from 'react';

import { useDataContext } from '../../data/DataContext';
import HoverableObjectName from '../common/HoverableObjectName';

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
