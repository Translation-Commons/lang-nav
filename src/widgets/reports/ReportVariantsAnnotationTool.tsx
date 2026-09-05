import { CopyIcon } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import VariantAnnotationTable from '@entities/variant/VariantAnnotationTable';
import { VariantData, VariantType } from '@entities/variant/VariantTypes';

import { Button } from '@shared/ui/button';
import EnumDropdown from '@shared/ui/EnumDropdown';

enum IncludeCriteria {
  HasData = 'has data',
  MissingData = 'missing data',
  Any = 'any',
}

const ReportVariantsAnnotationTool: React.FC = () => {
  const { variants } = useDataContext();

  const [includeCriteria, setIncludeCriteria] = useState(IncludeCriteria.Any);
  const viewedVariants = useMemo(
    () =>
      variants.filter((variant) => {
        const missingData =
          variant.variantType == null ||
          (variant.variantType === VariantType.Dialect && variant.equivalentLanguageCode == null);
        if (includeCriteria === IncludeCriteria.Any) return true;
        if (includeCriteria === IncludeCriteria.HasData) return !missingData;
        if (includeCriteria === IncludeCriteria.MissingData) return missingData;
      }),
    [includeCriteria, variants.length], // Intentionally not memoizing on `variants` since when a variant is updated it would change state
  );
  const [changedVariants, setChangedVariants] = useState<VariantData[]>([]);
  const addToChangedVariants = useCallback((variant: VariantData) => {
    // If the state doesn't change at all a refresh does not happen
    setChangedVariants((prev) => (prev.includes(variant) ? [...prev] : [...prev, variant]));
  }, []);
  const copyAnnotatedVariants = useCallback(() => {
    const clipboardText = variants
      .filter((variant) => variant.variantType != null)
      .sort(sortByPopulation)
      .map((variant) =>
        [
          variant.ID,
          variant.variantType,
          variant.equivalentLanguage?.ID ?? variant.equivalentLanguageCode,
        ].join('\t'),
      )
      .join('\n');
    navigator.clipboard.writeText('ID\tVariantType\tEquivalentLanguageCode\n' + clipboardText);
  }, [variants]);

  return (
    <>
      This is a tool to help add annotations to variants, such as classifying it as orthographic or
      dialectal. For dialects there is also an option to specify which equivalent language it
      corresponds to.
      <div>
        Filter variants:{' '}
        <EnumDropdown<IncludeCriteria>
          value={includeCriteria}
          onChange={setIncludeCriteria}
          options={Object.values(IncludeCriteria)}
        />
      </div>
      <VariantAnnotationTable
        variants={viewedVariants}
        addToChangedVariants={addToChangedVariants}
      />
      <Button
        onClick={copyAnnotatedVariants}
        disabled={changedVariants.length === 0}
        variant="secondary"
      >
        <CopyIcon />
        Copy annotated variants ({changedVariants.length})
      </Button>
    </>
  );
};

export default ReportVariantsAnnotationTool;
