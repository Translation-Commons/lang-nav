import { CensusHierarchy } from '@widgets/treelists/CensusHierarchy';
import { LanguageHierarchy } from '@widgets/treelists/LanguageHierarchy';
import { LocaleHierarchy } from '@widgets/treelists/LocaleHierarchy';
import { OrganizationHierarchy } from '@widgets/treelists/OrganizationHierarchy';
import { TerritoryHierarchy } from '@widgets/treelists/TerritoryHierarchy';
import { VariantHierarchy } from '@widgets/treelists/VariantHierarchy';
import { WritingSystemHierarchy } from '@widgets/treelists/WritingSystemHierarchy';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

function ViewFamilyTree() {
  const { entType } = usePageParams();

  switch (entType) {
    case EntityType.Census:
      return <CensusHierarchy />;
    case EntityType.Language:
      return <LanguageHierarchy />;
    case EntityType.Locale:
      return <LocaleHierarchy />;
    case EntityType.Territory:
      return <TerritoryHierarchy />;
    case EntityType.WritingSystem:
      return <WritingSystemHierarchy />;
    case EntityType.Variant:
      return <VariantHierarchy />;
    case EntityType.Org:
      return <OrganizationHierarchy />;
    case EntityType.Keyboard:
      return 'Family trees are not defined well for this type';
  }
}

export default ViewFamilyTree;
