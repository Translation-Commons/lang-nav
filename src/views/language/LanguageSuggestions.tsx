import React from 'react';

import { useDataContext } from '../../data/DataContext';
import HoverableObjectName from '../common/HoverableObjectName';

const LanguageSuggestions: React.FC = () => {
  const { languagesBySource } = useDataContext();

  return (
    <div className="separatedButtonList">
      {['eng', 'spa', 'fra', 'deu', 'zho', 'ara'].map(
        (code) =>
          languagesBySource.ISO[code] != null && (
            <HoverableObjectName key={code} object={languagesBySource.ISO[code]} format="button" />
          ),
      )}
    </div>
  );
};

export default LanguageSuggestions;
