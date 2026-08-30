import { GridIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Toggle } from '@shared/ui/toggle';

import { LanguageData } from '../LanguageTypes';

import { findLanguagePluralRules } from './LanguagePluralComputation';
import LanguagePluralGrid from './LanguagePluralGrid';

type Props = {
  lang: LanguageData;
  showTooltips?: boolean;
};

const LanguagePluralGridButton: React.FC<Props> = ({ lang, showTooltips }) => {
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
      <Toggle
        className="cursor-pointer"
        pressed={isGridVisible}
        onPressedChange={() => setIsGridVisible((prev) => !prev)}
        variant="outline"
      >
        <GridIcon />
        show grid
      </Toggle>
      {isGridVisible && <LanguagePluralGrid lang={lang} showTooltips={showTooltips} />}
    </>
  );
};

export default LanguagePluralGridButton;
