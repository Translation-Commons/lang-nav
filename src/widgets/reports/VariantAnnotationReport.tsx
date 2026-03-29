import { CopyIcon } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import Selector from '@features/params/ui/Selector';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import ToggleablePrediction from '@entities/ui/ToggleablePrediction';
import { VariantData, VariantType } from '@entities/variant/VariantTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';

import { getVariantTypeDisplay } from '@strings/VariantStrings';

enum IncludeCriteria {
  HasData = 'has data',
  MissingData = 'missing data',
  Any = 'any',
}

const VariantAnnotationReport: React.FC = () => {
  const { variants } = useDataContext();

  const [includeCriteria, setIncludeCriteria] = useState(IncludeCriteria.MissingData);
  const viewedVariants = useMemo(
    () =>
      variants.filter((variant) => {
        const hasData = variant.variantType != null;
        if (includeCriteria === IncludeCriteria.Any) return true;
        if (includeCriteria === IncludeCriteria.HasData) return hasData;
        if (includeCriteria === IncludeCriteria.MissingData) return !hasData;
      }),
    [includeCriteria, variants.length], // Intentionally not memoizing on `variants` since when a variant is updated it would change state
  );

  const [changedVariants, setChangedVariants] = useState<VariantData[]>([]);
  const addToChangedVariants = useCallback((variant: VariantData) => {
    // If the state doesn't change at all a refresh does not happen
    setChangedVariants((prev) => (prev.includes(variant) ? [...prev] : [...prev, variant]));
  }, []);
  const copyChangedVariants = useCallback(() => {
    const clipboardText = changedVariants
      .filter((variant) => variant.variantType != null)
      .map((variant) => [variant.ID, variant.variantType].join('\t'))
      .join('\n');
    navigator.clipboard.writeText(clipboardText);
  }, [changedVariants]);

  return (
    <CollapsibleReport title="Variant Annotations">
      <Selector<IncludeCriteria>
        selectorLabel="Which Variants?"
        selected={includeCriteria}
        onChange={setIncludeCriteria}
        options={Object.values(IncludeCriteria)}
      />
      <InteractiveObjectTable
        objects={viewedVariants}
        tableID={TableID.VariantAnnotation}
        columns={[
          CodeColumn,
          NameColumn,
          {
            key: 'Type (Predicted)',
            render: (variant) => (
              <VariantTypeToggle variant={variant} addToChangedVariants={addToChangedVariants} />
            ),
          },
          { key: 'Description', render: (variant) => variant.description ?? '' },
        ]}
      />
      <button
        onClick={copyChangedVariants}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}
      >
        <CopyIcon size="1em" />
        Copy changed variants ({changedVariants.length})
      </button>
    </CollapsibleReport>
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

export default VariantAnnotationReport;
