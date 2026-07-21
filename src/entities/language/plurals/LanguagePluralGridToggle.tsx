import { GridIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import { LanguageData } from '../LanguageTypes';

import { findLanguagePluralRules } from './LanguagePluralComputation';
import LanguagePluralGrid from './LanguagePluralGrid';

const LanguagePluralGridButton: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const [isGridVisible, setIsGridVisible] = useState(false);

  if (!lang) return null;

  // Find the plural rules for this language
  const pluralRules = useMemo(() => findLanguagePluralRules(lang), [lang]);

  // If we didn't find any, or they are empty, return nothing
  if (!pluralRules || pluralRules.length === 0) {
    return <></>;
  }

  return (
    <>
      {/* TODO: make a toggle button */}
      <HoverableButton
        hoverContent={
          <>
            click to persist
            <LanguagePluralGrid lang={lang} />
          </>
        }
        className="py-1 px-2 ml-2"
        onClick={() => setIsGridVisible((prev) => !prev)}
      >
        <GridIcon size="1em" className="mr-1 align-middle" />
        examples
      </HoverableButton>
      {isGridVisible && <LanguagePluralGrid lang={lang} />}
    </>
  );
};

export default LanguagePluralGridButton;
