import HoverableObjectName from '@entities/ui/HoverableObjectName';
import DetailsField from '@features/details/DetailsField';
import DetailsSection from '@features/details/DetailsSection';
import React from 'react';

import { CensusData } from './CensusTypes';
import TableOfLanguagesInCensus from './TableOfLanguagesInCensus';

type Props = {
  census: CensusData;
};

const CensusDetails: React.FC<Props> = ({ census }) => {
  return (
    <div className="Details">
      <CensusPrimarySection census={census} />
      <CensusPopulationCharacteristics census={census} />
      <CensusSourceSection census={census} />
      <DetailsSection title="Languages">
        <TableOfLanguagesInCensus census={census} />
      </DetailsSection>
    </div>
  );
};

function CensusPrimarySection({ census }: { census: CensusData }) {
  const { territory, isoRegionCode, domain, proficiency, acquisitionOrder, modality } = census;
  return (
    <DetailsSection title="Primary Information">
      <DetailsField title="Territory:">
        {territory != null ? (
          <HoverableObjectName object={territory} />
        ) : (
          <span>{isoRegionCode}</span>
        )}
      </DetailsField>
      <DetailsField title="Year:">{census.yearCollected}</DetailsField>
      {modality != null && <DetailsField title="Modality:">{modality}</DetailsField>}
      {proficiency != null && <DetailsField title="Proficiency:">{proficiency}</DetailsField>}
      {acquisitionOrder != null && (
        <DetailsField title="Acquisition Order:">{acquisitionOrder}</DetailsField>
      )}
      {domain != null && <DetailsField title="Where language used:">{domain}</DetailsField>}
    </DetailsSection>
  );
}

function CensusPopulationCharacteristics({ census }: { census: CensusData }) {
  const {
    age,
    eligiblePopulation,
    geographicScope,
    languagesIncluded,
    notes,
    respondingPopulation,
    responsesPerIndividual,
    sampleRate,
  } = census;

  return (
    <DetailsSection title="Population Characteristics">
      <DetailsField title="Eligible Population:">
        {eligiblePopulation.toLocaleString()}
      </DetailsField>
      {respondingPopulation && (
        <DetailsField title="Responding Population:">
          {respondingPopulation.toLocaleString()}
        </DetailsField>
      )}
      {sampleRate && (
        <DetailsField title="Sample rate:">{(sampleRate * 100).toLocaleString()}%</DetailsField>
      )}
      {languagesIncluded != null && (
        <DetailsField title="Languages Included:">{languagesIncluded}</DetailsField>
      )}
      {geographicScope != null && (
        <DetailsField title="Geographic Scope:">{geographicScope}</DetailsField>
      )}
      {age != null && <DetailsField title="Age:">{age}</DetailsField>}
      {responsesPerIndividual != null && (
        <DetailsField title="Responses per Individual:">{responsesPerIndividual}</DetailsField>
      )}
      {notes != null && <DetailsField title="Notes:">{notes}</DetailsField>}
    </DetailsSection>
  );
}

function CensusSourceSection({ census }: { census: CensusData }) {
  const {
    citation,
    collectorName,
    collectorType,
    columnName,
    dateAccessed,
    datePublished,
    tableName,
    url,
  } = census;

  return (
    <DetailsSection title="Source">
      <DetailsField title="Collected by:">
        {collectorName == null ? collectorType : `${collectorName} (${collectorType})`}
      </DetailsField>
      {tableName && <DetailsField title="Table Name:">{tableName}</DetailsField>}
      {columnName && <DetailsField title="Column Name:">{columnName}</DetailsField>}
      {citation && <DetailsField title="Citation:">{citation}</DetailsField>}
      {url && (
        <DetailsField title="URL:">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </DetailsField>
      )}
      {datePublished && (
        <DetailsField title="Date Published:">
          {new Date(datePublished).toLocaleDateString()}
        </DetailsField>
      )}
      {dateAccessed && (
        <DetailsField title="Date Accessed:">
          {new Date(dateAccessed).toLocaleDateString()}
        </DetailsField>
      )}
    </DetailsSection>
  );
}

export default CensusDetails;
