import { CensusHierarchy } from '@widgets/treelists/CensusHierarchy';
import { LanguageHierarchy } from '@widgets/treelists/LanguageHierarchy';
import { LocaleHierarchy } from '@widgets/treelists/LocaleHierarchy';
import { TerritoryHierarchy } from '@widgets/treelists/TerritoryHierarchy';
import { VariantHierarchy } from '@widgets/treelists/VariantHierarchy';
import { WritingSystemHierarchy } from '@widgets/treelists/WritingSystemHierarchy';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

function ViewFamilyTree() {
  const { objectType } = usePageParams();

  switch (objectType) {
    case ObjectType.Census:
      return <CensusHierarchy />;
    case ObjectType.Language:
      return <LanguageHierarchy />;
    case ObjectType.Locale:
      return <LocaleHierarchy />;
    case ObjectType.Territory:
      return <TerritoryHierarchy />;
    case ObjectType.WritingSystem:
      return <WritingSystemHierarchy />;
    case ObjectType.Variant:
      return <VariantHierarchy />;
  }
}

export default ViewFamilyTree;
