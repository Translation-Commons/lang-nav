import React from 'react';

import { useDataContext } from '../../data/DataContext';
import HoverableObjectName from '../common/HoverableObjectName';

const WritingSystemSuggestions: React.FC = () => {
  const { writingSystems } = useDataContext();

  return (
    <div className="separatedButtonList">
      {['Latn', 'Cyrl', 'Arab', 'Hans', 'Hant'].map(
        (code) =>
          writingSystems[code] != null && (
            <HoverableObjectName key={code} object={writingSystems[code]} format="button" />
          ),
      )}
    </div>
  );
};

export default WritingSystemSuggestions;
