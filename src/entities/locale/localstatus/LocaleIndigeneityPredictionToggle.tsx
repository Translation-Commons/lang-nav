import React from 'react';

import { LocaleData } from '@entities/locale/LocaleTypes';
import ToggleablePrediction from '@entities/ui/ToggleablePrediction';

import {
  getHistoricPresencePrediction,
  getLocaleFormedHerePrediction,
} from './LocaleIndigeneityPredictions';

export const LocaleFormedHerePredictionToggle: React.FC<{
  loc: LocaleData;
  addToChangedLocales: (locale: LocaleData) => void;
}> = ({ loc, addToChangedLocales }) => {
  const saved = loc.langFormedHere;
  const predicted = getLocaleFormedHerePrediction(loc);
  return (
    <ToggleablePrediction
      currentValue={saved}
      predictedValue={predicted}
      predictedText={(saved ?? predicted) ? 'Formed here' : 'From abroad'}
      onToggle={() => {
        if (loc.langFormedHere == null) {
          // If no data, toggle to predicted value
          loc.langFormedHere = predicted;
        } else if (loc.langFormedHere === predicted) {
          // If currently same as predicted, toggle to opposite of predicted
          loc.langFormedHere = !predicted;
        } else {
          // If currently opposite of predicted, clear it
          loc.langFormedHere = undefined;
        }
        addToChangedLocales(loc);
      }}
    />
  );
};

export const HistoricPresencePredictionToggle: React.FC<{
  loc: LocaleData;
  addToChangedLocales: (locale: LocaleData) => void;
}> = ({ loc, addToChangedLocales }) => {
  const saved = loc.historicPresence;
  const predicted = getHistoricPresencePrediction(loc);
  return (
    <ToggleablePrediction
      currentValue={saved}
      predictedValue={predicted}
      predictedText={(saved ?? predicted) ? 'Historic' : '> 1500'}
      onToggle={() => {
        if (loc.historicPresence == null) {
          // If no data, toggle to predicted value
          loc.historicPresence = predicted;
        } else if (loc.historicPresence === predicted) {
          // If currently same as predicted, toggle to opposite of predicted
          loc.historicPresence = !predicted;
        } else {
          // If currently opposite of predicted, clear it
          loc.historicPresence = undefined;
        }
        addToChangedLocales(loc);
      }}
    />
  );
};
