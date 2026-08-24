import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { CensusData } from '@entities/census/CensusTypes';

import DetailsField from '../ui/DetailsField';
import DetailsSection from '../ui/DetailsSection';

function CensusPrimarySection({ census }: { census: CensusData }) {
  const { territory, isoRegionCode, domain, proficiency, acquisitionOrder, languageUse } = census;
  return (
    <DetailsSection title="Primary Information">
      <DetailsField title="Territory">
        {territory != null ? <HoverableObjectName ent={territory} /> : <span>{isoRegionCode}</span>}
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
