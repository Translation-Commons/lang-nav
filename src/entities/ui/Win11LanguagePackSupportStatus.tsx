import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LanguageData } from '@entities/language/LanguageTypes';

const Win11LanguagePackSupportStatus: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang.win11LanguagePacks || lang.win11LanguagePacks.length === 0) {
    return (
      <Hoverable hoverContent="No official language pack available.">
        <XCircleIcon className="text-red align-middle" size={'1em'} />
      </Hoverable>
    );
  }

  const hoverContent = lang.win11LanguagePacks
    .map((entry) => {
      const parts = [entry.name];
      if (entry.locale) parts.push(`(${entry.locale})`);
      if (entry.writingSystem) parts.push(`${entry.writingSystem}`);
      return parts.join(' ');
    })
    .join(', ');

  return (
    <Hoverable hoverContent={hoverContent}>
      <CheckCircle2Icon className="text-green align-middle" size={'1em'} />
    </Hoverable>
  );
};

export default Win11LanguagePackSupportStatus;
