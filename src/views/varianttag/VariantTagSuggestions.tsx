import React from 'react';

import { useDataContext } from '../../data/DataContext';
import HoverableObjectName from '../common/HoverableObjectName';

const VariantTagSuggestions: React.FC = () => {
  const { variantTags } = useDataContext();

  return (
    <div className="separatedButtonList">
      {['valencia', 'grclass', 'rumgr', 'pinyin'].map(
        (code) =>
          variantTags[code] != null && (
            <HoverableObjectName key={code} object={variantTags[code]} format="button" />
          ),
      )}
    </div>
  );
};
export default VariantTagSuggestions;
