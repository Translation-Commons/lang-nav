import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { CensusData } from '@entities/census/CensusTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import { toTitleCase } from '@shared/lib/stringUtils';

import TableOfLanguagesInCensus from '../tables/TableOfLanguagesInCensus';

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
    quantity,
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
        <DetailsField title="Sample rate:">
          {typeof sampleRate === 'number' ? (sampleRate * 100).toLocaleString() + '%' : sampleRate}
        </DetailsField>
      )}
      {languagesIncluded && (
        <DetailsField title="Languages Included:">{languagesIncluded}</DetailsField>
      )}
      {geographicScope && <DetailsField title="Geographic Scope:">{geographicScope}</DetailsField>}
      {age && <DetailsField title="Age:">{age}</DetailsField>}
      {responsesPerIndividual && (
        <DetailsField title="Responses per Individual:">{responsesPerIndividual}</DetailsField>
      )}
      {quantity && <DetailsField title="Quantity Provided:">{toTitleCase(quantity)}</DetailsField>}
      {notes && <DetailsField title="Notes:">{notes}</DetailsField>}
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
