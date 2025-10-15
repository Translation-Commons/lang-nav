import HoverableObjectName from '@entities/ui/HoverableObjectName';
import { useDataContext } from '@features/data-loading/DataContext';
import React from 'react';

const VariantTagSuggestions: React.FC = () => {
  const { getVariantTag } = useDataContext();

  return (
    <div className="separatedButtonList">
      {['valencia', 'grclass', 'rumgr', 'pinyin'].map((code) => (
        <HoverableObjectName key={code} object={getVariantTag(code)} format="button" />
      ))}
    </div>
  );
};
export default VariantTagSuggestions;
