import React, { useCallback, useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { SearchableField } from '@features/params/PageParamTypes';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableColumn from '@features/table/TableColumn';
import TableID from '@features/table/TableID';
import { getLanguagesRelevantToObject } from '@features/transforms/filtering/filterByConnections';
import getSubstringFilterOnQuery from '@features/transforms/search/getSubstringFilterOnQuery';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import ToggleablePrediction from '@entities/ui/ToggleablePrediction';
import { VariantData, VariantType } from '@entities/variant/VariantTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

import { getVariantTypeDisplay } from '@strings/VariantStrings';

import VariantLanguoidToggle from './VariantLanguoidToggle';

type Props = {
  variants: VariantData[];
  addToChangedVariants: (variant: VariantData) => void;
};

const VariantAnnotationTable: React.FC<Props> = ({ variants, addToChangedVariants }) => {
  const { languagesInSelectedSource } = useDataContext();
  const languageUncoded = languagesInSelectedSource.find((l) => l.ID === 'mis')!;

  const getPredictedLanguoid = useCallback(
    async (variant: VariantData): Promise<LanguageData | undefined> => {
      const words = variant.nameDisplay.toLowerCase().split(/\s+/);
      const matchingWord = words[0] === 'the' ? words[1] : words[0];
      const match = getSubstringFilterOnQuery(matchingWord, SearchableField.NameAny);
      // Try matching within connected languoids first since those are more likely to be correct than a random match across the whole dataset
      const connectedLanguoids = languagesInSelectedSource.filter(
        (languoid) =>
          languoid.scope !== LanguageScope.Family &&
          getLanguagesRelevantToObject(languoid).some((relevant) =>
            variant.languages.some((l) => l.ID === relevant.ID),
          ),
      );
      const connectedMatchingLanguoids = connectedLanguoids.filter(match);
      if (connectedMatchingLanguoids.length > 0) return connectedMatchingLanguoids[0];

      return languagesInSelectedSource.filter(match)[0];
    },
    [languagesInSelectedSource],
  );

  const columns = useMemo(
    () =>
      [
        CodeColumn,
        NameColumn,
        { key: 'Description', render: (variant) => variant.description ?? '' },
        {
          key: 'Type (Predicted)',
          render: (variant) => (
            <VariantTypeToggle variant={variant} addToChangedVariants={addToChangedVariants} />
          ),
        },
        {
          key: 'Languoid (Predicted)',
          render: (variant) =>
            variant.variantType !== VariantType.Orthographic && (
              <VariantLanguoidToggle
                variant={variant}
                getPredictedLanguoid={getPredictedLanguoid}
                addToChangedVariants={addToChangedVariants}
                languageUncoded={languageUncoded}
              />
            ),
        },
        {
          key: 'Languages',
          render: (variant) => (
            <CommaSeparated limit={1} limitText="short">
              {variant.languages.map((l) => (
                <HoverableObjectName key={l.ID} object={l} />
              ))}
            </CommaSeparated>
          ),
        },
      ] as TableColumn<VariantData>[],
    [addToChangedVariants, getPredictedLanguoid, languageUncoded],
  );

  return (
    <InteractiveObjectTable
      objects={variants}
      tableID={TableID.VariantAnnotation}
      columns={columns}
    />
  );
};

export const VariantTypeToggle: React.FC<{
  variant: VariantData;
  addToChangedVariants: (variant: VariantData) => void;
}> = ({ variant, addToChangedVariants }) => {
  const saved = variant.variantType;
  const predicted = getPredictedVariantType(variant);
  return (
    <ToggleablePrediction
      currentValue={saved}
      predictedValue={predicted}
      predictedText={getVariantTypeDisplay(saved ?? predicted)}
      onToggle={() => {
        if (variant.variantType == null) {
          // If no data, toggle to predicted value
          variant.variantType = predicted;
        } else if (variant.variantType === predicted) {
          // If currently same as predicted, toggle to opposite of predicted
          variant.variantType =
            predicted === VariantType.Orthographic ? VariantType.Dialect : VariantType.Orthographic;
        } else {
          // If currently opposite of predicted, clear it
          variant.variantType = undefined;
        }
        addToChangedVariants(variant);
      }}
    />
  );
};

const orthographicKeywords = ['spell', 'transliterat', 'alphabet', 'orthograph'];
const dialectKeywords = ['dialect', 'idiom'];

function getPredictedVariantType(variant: VariantData): VariantType {
  // Try the name
  if (hasKeywords(variant.nameDisplay, orthographicKeywords)) return VariantType.Orthographic;
  if (hasKeywords(variant.nameDisplay, dialectKeywords)) return VariantType.Dialect;

  // Try the description
  if (hasKeywords(variant.description ?? '', orthographicKeywords)) return VariantType.Orthographic;

  // Default prediction if no keywords are found
  return VariantType.Dialect;
}

function hasKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword));
}

export default VariantAnnotationTable;
