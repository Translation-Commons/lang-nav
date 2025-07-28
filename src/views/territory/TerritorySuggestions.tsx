import React from 'react';

import { useDataContext } from '../../data/DataContext';
import HoverableObjectName from '../common/HoverableObjectName';

const TerritorySuggestions: React.FC = () => {
  const { territories } = useDataContext();

  return (
    <div className="separatedButtonList">
      {['US', 'MX', 'FR', 'RU', 'EG', 'CN'].map(
        (code) =>
          territories[code] != null && (
            <HoverableObjectName key={code} object={territories[code]} format="button" />
          ),
      )}
    </div>
  );
};
export default TerritorySuggestions;
