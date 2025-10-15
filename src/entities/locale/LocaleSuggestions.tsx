import HoverableObjectName from '@entities/ui/HoverableObjectName';
import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

const LocaleSuggestions: React.FC = () => {
  const { getLocale } = useDataContext();

  return (
    <div className="separatedButtonList">
      {['eng_US', 'spa_419', 'fra_FR', 'rus_RU', 'arb_001', 'zho_Hans_CN', 'cmn_CN'].map((code) => (
        <HoverableObjectName key={code} object={getLocale(code)} format="button" />
      ))}
    </div>
  );
};

export default LocaleSuggestions;
