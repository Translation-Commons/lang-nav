import React from 'react';

import { useDataContext } from '@features/data-loading/DataContext';

import HoverableObjectName from '@entities/ui/HoverableObjectName';

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
