import React from 'react';

import { useDataContext } from '../../data/DataContext';
import HoverableObjectName from '../common/HoverableObjectName';

const LanguageSuggestions: React.FC = () => {
  const { getLanguage } = useDataContext();

  return (
    <div className="separatedButtonList">
      {['eng', 'spa', 'fra', 'rus', 'zho', 'ara'].map((code) => (
        <HoverableObjectName key={code} object={getLanguage(code)} format="button" />
      ))}
    </div>
  );
};

export default LanguageSuggestions;
