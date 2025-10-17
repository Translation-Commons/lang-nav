import { CensusHierarchy } from '@widgets/treelists/CensusHierarchy';
import { LanguageHierarchy } from '@widgets/treelists/LanguageHierarchy';
import { LocaleHierarchy } from '@widgets/treelists/LocaleHierarchy';
import { TerritoryHierarchy } from '@widgets/treelists/TerritoryHierarchy';
import { VariantTagHierarchy } from '@widgets/treelists/VariantTagHierarchy';
import { WritingSystemHierarchy } from '@widgets/treelists/WritingSystemHierarchy';

import { ObjectType } from '@features/page-params/PageParamTypes';
import { usePageParams } from '@features/page-params/usePageParams';

import './styles.css';

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
    case ObjectType.VariantTag:
      return <VariantTagHierarchy />;
  }
}

export default ViewFamilyTree;
