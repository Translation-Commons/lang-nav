import React, { useCallback, useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { Suggestion } from '@features/params/Suggestion';
import { getSuggestionsFunction } from '@features/transforms/filtering/getSuggestionsFunction';
import EntitySearchCombobox from '@features/transforms/search/EntitySearchCombobox';

import { LanguageData } from '@entities/language/LanguageTypes';
import ToggleablePrediction from '@entities/ui/ToggleablePrediction';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import { VariantData, VariantType } from './VariantTypes';

enum LanguageSelectorMode {
  Current,
  Manual,
  Uncoded,
  Unset,
}

const VariantLanguoidToggle: React.FC<{
  variant: VariantData;
  getPredictedLanguoid: (variant: VariantData) => Promise<LanguageData | undefined>;
  addToChangedVariants: (variant: VariantData) => void;
  languageUncoded: LanguageData;
}> = ({ variant, getPredictedLanguoid, addToChangedVariants, languageUncoded }) => {
  // getPredictedLanguoid is expensive to compute so we want to call it as little as possible and cache the result
  const saved = variant.equivalentLanguage;
  const [predicted, setPredicted] = React.useState<LanguageData | undefined>(languageUncoded);
  const [languageSelectorMode, setLanguageSelectorMode] = React.useState<LanguageSelectorMode>(
    LanguageSelectorMode.Unset,
  );

  React.useEffect(() => {
    let isMounted = true;
    getPredictedLanguoid(variant).then((pred) => {
      if (isMounted && pred) setPredicted(pred);
    });
    return () => {
      isMounted = false;
    };
  }, [variant, getPredictedLanguoid]);
  const onCycle = useCallback(() => {
    switch (languageSelectorMode) {
      case LanguageSelectorMode.Current:
        setLanguageSelectorMode(LanguageSelectorMode.Manual);
        variant.equivalentLanguage = undefined;
        break;
      case LanguageSelectorMode.Manual:
        setLanguageSelectorMode(LanguageSelectorMode.Uncoded);
        variant.equivalentLanguage = languageUncoded;
        variant.equivalentLanguageCode = languageUncoded.ID;
        break;
      case LanguageSelectorMode.Uncoded:
        setLanguageSelectorMode(LanguageSelectorMode.Unset);
        variant.equivalentLanguage = undefined;
        variant.equivalentLanguageCode = undefined;
        break;
      case LanguageSelectorMode.Unset:
        setLanguageSelectorMode(LanguageSelectorMode.Current);
        variant.equivalentLanguage = predicted;
        break;
    }
    addToChangedVariants(variant);
  }, [
    variant.equivalentLanguage,
    variant.equivalentLanguageCode,
    predicted,
    languageUncoded,
    addToChangedVariants,
    languageSelectorMode,
  ]);

  if (variant.variantType === VariantType.Orthographic) return null;

  let predictedText = undefined;
  switch (languageSelectorMode) {
    case LanguageSelectorMode.Current:
      predictedText = <HoverableEntityName ent={saved ?? predicted} />;
      break;
    case LanguageSelectorMode.Manual:
      predictedText = (
        <LanguageSelector
          submit={(value: Suggestion) => {
            const id = value.entID;
            if (!id) return;
            variant.equivalentLanguageCode = id;
            addToChangedVariants(variant);
          }}
        />
      );
      break;
    case LanguageSelectorMode.Uncoded:
      predictedText = <HoverableEntityName ent={languageUncoded} />;
      break;
    case LanguageSelectorMode.Unset:
      predictedText = <HoverableEntityName ent={saved ?? predicted} />;
      break;
  }

  return (
    <ToggleablePrediction
      currentValue={saved}
      predictedValue={predicted}
      predictedText={predictedText}
      onToggle={onCycle}
    />
  );
};

const LanguageSelector: React.FC<{
  submit: (suggestion: Suggestion) => void;
}> = ({ submit }) => {
  const { languagesInSelectedSource: languages } = useDataContext();

  const getSuggestions = useMemo(() => {
    const getMatchDistance = (lang: LanguageData): number => lang.scope ?? 0;
    const getMatchGroup = (lang: LanguageData): string => getLanguageScopeLabel(lang.scope);

    return getSuggestionsFunction(languages, getMatchDistance, getMatchGroup);
  }, [languages]);

  return (
    <EntitySearchCombobox
      getSuggestions={getSuggestions}
      onSelect={submit}
      placeholder={'language name or code'}
      className="w-40"
    />
  );
};

export default VariantLanguoidToggle;
