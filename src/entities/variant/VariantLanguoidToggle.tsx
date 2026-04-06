import React, { useCallback, useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { PageParamKey } from '@features/params/PageParamTypes';
import TextInput from '@features/params/ui/TextInput';
import { getSuggestionsFunction } from '@features/transforms/filtering/getSuggestionsFunction';

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
  const saved = variant.languoid;
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
        variant.languoid = undefined;
        break;
      case LanguageSelectorMode.Manual:
        setLanguageSelectorMode(LanguageSelectorMode.Uncoded);
        variant.languoid = languageUncoded;
        variant.languoidCode = languageUncoded.ID;
        break;
      case LanguageSelectorMode.Uncoded:
        setLanguageSelectorMode(LanguageSelectorMode.Unset);
        variant.languoid = undefined;
        variant.languoidCode = undefined;
        break;
      case LanguageSelectorMode.Unset:
        setLanguageSelectorMode(LanguageSelectorMode.Current);
        variant.languoid = predicted;
        break;
    }
    addToChangedVariants(variant);
  }, [variant.languoid, predicted, languageUncoded, addToChangedVariants, languageSelectorMode]);

  if (variant.variantType === VariantType.Orthographic) return null;

  let predictedText = undefined;
  switch (languageSelectorMode) {
    case LanguageSelectorMode.Current:
      predictedText = <HoverableObjectName object={saved ?? predicted} />;
      break;
    case LanguageSelectorMode.Manual:
      predictedText = (
        <LanguageSelector
          submit={(value) => {
            const id = value.split(/\[|\]/)[1]?.trim(); // In case they paste in something with extra info like "valencia [cat_valencia]"
            if (!id) return;
            variant.languoidCode = id;
            addToChangedVariants(variant);
          }}
        />
      );
      break;
    case LanguageSelectorMode.Uncoded:
      predictedText = <HoverableObjectName object={languageUncoded} />;
      break;
    case LanguageSelectorMode.Unset:
      predictedText = <HoverableObjectName object={saved ?? predicted} />;
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
  submit: (languageString: string) => void;
}> = ({ submit }) => {
  const { languagesInSelectedSource: languages } = useDataContext();

  const getSuggestions = useMemo(() => {
    const getMatchDistance = (lang: LanguageData): number => lang.scope ?? 0;
    const getMatchGroup = (lang: LanguageData): string => getLanguageScopeLabel(lang.scope);

    return getSuggestionsFunction(languages, getMatchDistance, getMatchGroup);
  }, [languages]);

  return (
    <TextInput
      inputStyle={{
        minWidth: '6em',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
      getSuggestions={getSuggestions}
      onSubmit={submit}
      pageParameter={PageParamKey.languageFilter}
      placeholder="Name or code"
      value=""
    />
  );
};

export default VariantLanguoidToggle;
