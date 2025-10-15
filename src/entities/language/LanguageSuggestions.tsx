import HoverableObjectName from '@entities/ui/HoverableObjectName';
import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

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
