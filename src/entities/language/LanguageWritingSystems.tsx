import React from 'react';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageData } from './LanguageTypes';

const LanguageWritingSystems: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const writingSystems = Object.values(lang.writingSystems ?? {});
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
