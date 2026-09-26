import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { CensusData } from './CensusTypes';

function CensusPrimarySection({ census }: { census: CensusData }) {
  const { territory, isoRegionCode, domain, proficiency, acquisitionOrder, languageUse } = census;
  return (
    <DetailsSection title="Primary Information">
      <DetailsField title="Territory">
        {territory != null ? <HoverableEntityName ent={territory} /> : <span>{isoRegionCode}</span>}
      </DetailsField>
      <DetailsField title="Year">{census.yearCollected}</DetailsField>
      {languageUse != null && <DetailsField title="Language Use">{languageUse}</DetailsField>}
      {proficiency != null && <DetailsField title="Proficiency">{proficiency}</DetailsField>}
      {acquisitionOrder != null && (
        <DetailsField title="Acquisition Order">{acquisitionOrder}</DetailsField>
      )}
      {domain != null && <DetailsField title="Where language used">{domain}</DetailsField>}
    </DetailsSection>
  );
}

export default CensusPrimarySection;
