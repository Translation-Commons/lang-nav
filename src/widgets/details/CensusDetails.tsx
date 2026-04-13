import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import LocalParamsProvider from '@features/params/LocalParamsProvider';

import { CensusData } from '@entities/census/CensusTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import { toTitleCase } from '@shared/lib/stringUtils';
import ExternalLink from '@shared/ui/ExternalLink';

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
        <LocalParamsProvider overrides={{ page: 1, limit: 20 }}>
          <TableOfLanguagesInCensus census={census} />
        </LocalParamsProvider>
      </DetailsSection>
    </div>
  );
};

function CensusPrimarySection({ census }: { census: CensusData }) {
  const { territory, isoRegionCode, domain, proficiency, acquisitionOrder, languageUse } = census;
  return (
    <DetailsSection title="Primary Information">
      <DetailsField title="Territory">
        {territory != null ? (
          <HoverableObjectName object={territory} />
        ) : (
          <span>{isoRegionCode}</span>
        )}
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

function CensusPopulationCharacteristics({ census }: { census: CensusData }) {
  const {
    age,
    geographicScope,
    languagesIncluded,
    notes,
    population,
    populationSource,
    populationSurveyed,
    populationWithPositiveResponses,
    quantity,
    residenceBasis,
    responsesPerIndividual,
    sampleRate,
  } = census;

  return (
    <DetailsSection title="Population Characteristics">
      <DetailsField title="Overall population">{population.toLocaleString()}</DetailsField>
      {populationSource && (
        <DetailsField title="Source for overall population">
          <ExternalLink href={populationSource} />
        </DetailsField>
      )}
      {populationWithPositiveResponses && (
        <DetailsField title="Responding Population">
          {populationWithPositiveResponses.toLocaleString()}
        </DetailsField>
      )}
      {populationSurveyed && (
        <DetailsField title="Surveyed Population">
          {populationSurveyed.toLocaleString()}
        </DetailsField>
      )}
      {sampleRate ? (
        <DetailsField title="Sample rate">
          {typeof sampleRate === 'number' ? (sampleRate * 100).toLocaleString() + '%' : sampleRate}
        </DetailsField>
      ) : populationSurveyed ? (
        <DetailsField title="Sample rate">
          {((populationSurveyed / population) * 100).toLocaleString()}%
        </DetailsField>
      ) : null}
      {languagesIncluded && (
        <DetailsField title="Languages Included">{languagesIncluded}</DetailsField>
      )}
      {geographicScope && <DetailsField title="Geographic Scope">{geographicScope}</DetailsField>}
      {residenceBasis && <DetailsField title="Residence Basis">{residenceBasis}</DetailsField>}
      {age && <DetailsField title="Age">{age}</DetailsField>}
      {responsesPerIndividual && (
        <DetailsField title="Responses per Individual">{responsesPerIndividual}</DetailsField>
      )}
      {quantity && <DetailsField title="Quantity Provided">{toTitleCase(quantity)}</DetailsField>}
      {notes && <DetailsField title="Notes">{notes}</DetailsField>}
    </DetailsSection>
  );
}

function CensusSourceSection({ census }: { census: CensusData }) {
  const {
    author,
    citation,
    columnName,
    collectorType,
    dateAccessed,
    datePublished,
    documentName,
    presentedBy,
    tableName,
    url,
  } = census;

  return (
    <DetailsSection title="Source">
      <DetailsField title="Source type">{collectorType}</DetailsField>
      <CensusCollectorNameDisplay census={census} />
      {author && <DetailsField title="Author">{author}</DetailsField>}
      {presentedBy && <DetailsField title="Presented by">{presentedBy}</DetailsField>}
      {url && (
        <DetailsField title="URL">
          <ExternalLink href={url} />
        </DetailsField>
      )}
      {documentName && <DetailsField title="Document Name">{documentName}</DetailsField>}
      {tableName && <DetailsField title="Table Name">{tableName}</DetailsField>}
      {columnName && <DetailsField title="Column Name">{columnName}</DetailsField>}
      {citation && <DetailsField title="Citation">{citation}</DetailsField>}
      {datePublished && (
        <DetailsField title="Date Published">
          {new Date(datePublished).toLocaleDateString()}
        </DetailsField>
      )}
      {dateAccessed && (
        <DetailsField title="Date Accessed">
          {new Date(dateAccessed).toLocaleDateString()}
        </DetailsField>
      )}
    </DetailsSection>
  );
}

const CensusCollectorNameDisplay: React.FC<{ census: CensusData }> = ({ census }) => {
  const { collectorName, collectorNameShort } = census;
  if (!collectorName && !collectorNameShort) return null;

  return (
    <DetailsField title="Collected by">
      {collectorName ? collectorName : collectorNameShort}
      {collectorName && collectorNameShort && ` aka ${collectorNameShort}`}
    </DetailsField>
  );
};

export default CensusDetails;
