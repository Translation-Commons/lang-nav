import HoverableObjectName from '@entities/ui/HoverableObjectName';
import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

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
