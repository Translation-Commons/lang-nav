import React from 'react';

import LimitInput from '../../controls/selectors/LimitInput';
import ScopeFilterSelector from '../../controls/selectors/ScopeFilterSelector';
import { CensusData } from '../../types/CensusTypes';
import HoverableObjectName from '../common/HoverableObjectName';

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
      <div className="section">
        <h3>Languages</h3>
        <div style={{ textAlign: 'center' }}>
          <LimitInput />
          <ScopeFilterSelector />
        </div>
        <TableOfLanguagesInCensus census={census} />
      </div>
    </div>
  );
};

function CensusPrimarySection({ census }: { census: CensusData }) {
  const { territory, isoRegionCode, domain, proficiency, acquisitionOrder, modality } = census;
  return (
    <div className="section">
      <div>
        <label>Territory:</label>
        {territory != null ? (
          <HoverableObjectName object={territory} />
        ) : (
          <span>{isoRegionCode}</span>
        )}
      </div>
      <div>
        <label>Year:</label> {census.yearCollected}
      </div>
      {modality != null && (
        <div>
          <label>Modality:</label> {modality}
        </div>
      )}
      {proficiency != null && (
        <div>
          <label>Proficiency:</label> {proficiency}
        </div>
      )}
      {acquisitionOrder != null && (
        <div>
          <label>Acquisition Order:</label> {acquisitionOrder}
        </div>
      )}
      {domain != null && (
        <div>
          <label>Where language used:</label> {domain}
        </div>
      )}
    </div>
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
    <div className="section">
      <h3>Population Characteristics</h3>
      <div>
        <label>Eligible Population:</label> {eligiblePopulation.toLocaleString()}
      </div>
      {respondingPopulation && (
        <div>
          <label>Responding Population:</label> {respondingPopulation.toLocaleString()}
        </div>
      )}
      {sampleRate && (
        <div>
          <label>Sample rate:</label> {(sampleRate * 100).toLocaleString()}%
        </div>
      )}
      {languagesIncluded != null && (
        <div>
          <label>Languages Included:</label> {languagesIncluded}
        </div>
      )}
      {geographicScope != null && (
        <div>
          <label>Geographic Scope:</label> {geographicScope}
        </div>
      )}
      {age != null && (
        <div>
          <label>Age:</label> {age}
        </div>
      )}
      {responsesPerIndividual != null && (
        <div>
          <label>Responses per Individual:</label> {responsesPerIndividual}
        </div>
      )}
      {notes != null && (
        <div>
          <label>Notes:</label> {notes}
        </div>
      )}
    </div>
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
    <div className="section">
      <h3>Source</h3>
      <div>
        <label>Collected by:</label>
        {collectorName == null ? collectorType : `${collectorName} (${collectorType})`}
      </div>
      {tableName && (
        <div>
          <label>Table Name:</label> {tableName}
        </div>
      )}
      {columnName && (
        <div>
          <label>Column Name:</label> {columnName}
        </div>
      )}
      {citation && (
        <div>
          <label>Citation:</label>
          {citation}
        </div>
      )}
      {url && (
        <div>
          <label>URL:</label>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </div>
      )}
      {datePublished && (
        <div>
          <label>Date Published:</label>
          {new Date(datePublished).toLocaleDateString()}
        </div>
      )}
      {dateAccessed && (
        <div>
          <label>Date Accessed:</label>
          {new Date(dateAccessed).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default CensusDetails;
