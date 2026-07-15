import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import CommaSeparated from '@shared/ui/old/CommaSeparated';
import Deemphasized from '@shared/ui/old/Deemphasized';

import { LanguageData } from './LanguageTypes';

const LanguageWritingSystems: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const writingSystems = Object.values(lang.writingSystems ?? {}).slice();
  if (writingSystems.length === 0) return <Deemphasized>—</Deemphasized>;

  // Reorder, putting the primary writing system first
  const primaryWS = lang.primaryWritingSystem;
  if (primaryWS) {
    writingSystems.sort((a, b) => (a.ID === primaryWS.ID ? -1 : b.ID === primaryWS.ID ? 1 : 0));
  }

  return (
    <CommaSeparated limit={1} limitText="short">
      {writingSystems.map((ws) => (
        <HoverableObjectName key={ws.ID} object={ws} />
      ))}
    </CommaSeparated>
  );
};

export default LanguageWritingSystems;
