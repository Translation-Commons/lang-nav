import React from 'react';

import { useDataContext } from '@features/data-loading/DataContext';

import HoverableObjectName from '@entities/ui/HoverableObjectName';

const WritingSystemSuggestions: React.FC = () => {
  const { getWritingSystem } = useDataContext();

  return (
    <div className="separatedButtonList">
      {['Latn', 'Cyrl', 'Arab', 'Hans', 'Hant'].map((code) => (
        <HoverableObjectName key={code} object={getWritingSystem(code)} format="button" />
      ))}
    </div>
  );
};

export default WritingSystemSuggestions;
