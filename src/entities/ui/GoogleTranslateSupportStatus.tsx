import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LanguageData } from '@entities/language/LanguageTypes';

const GoogleTranslateSupportStatus: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang.googleTranslate || lang.googleTranslate.length === 0) {
    return (
      <XCircleIcon style={{ color: 'var(--color-red)', verticalAlign: 'middle' }} size={'1em'} />
    );
  }

  const hoverContent = lang.googleTranslate.map((entry) => entry.name).join(', ');

  return (
    <Hoverable hoverContent={hoverContent}>
      <CheckCircle2Icon
        style={{ color: 'var(--color-green)', verticalAlign: 'middle' }}
        size={'1em'}
      />
    </Hoverable>
  );
};

export default GoogleTranslateSupportStatus;
