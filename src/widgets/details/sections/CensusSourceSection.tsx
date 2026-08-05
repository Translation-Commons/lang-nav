import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { CensusData } from '@entities/census/CensusTypes';

import ExternalLink from '@shared/ui/ExternalLink';

import DetailsField from '../ui/DetailsField';
import DetailsSection from '../ui/DetailsSection';

type Props = {
  census: CensusData;
};

const CensusSourceSection: React.FC<Props> = ({ census }) => {
  const {
    author,
    citation,
    columnName,
    collectorType,
    dateAccessed,
    datePublished,
    documentName,
    presentedBy,
    sectionName,
    tableName,
    url,
  } = census;

  return (
    <DetailsSection title="Source">
      <DetailsField title="Source type">{collectorType}</DetailsField>
      <CensusCollectorNameDisplay census={census} />
      {author && <DetailsField title="Author">{author}</DetailsField>}
      {(census.presenter || presentedBy) && (
        <DetailsField title="Presented by">
          {census.presenter ? <HoverableObjectName object={census.presenter} /> : presentedBy}
        </DetailsField>
      )}
      {url && (
        <DetailsField title="URL">
          <ExternalLink href={url} />
        </DetailsField>
      )}
      {documentName && <DetailsField title="Document Name">{documentName}</DetailsField>}
      {sectionName && <DetailsField title="Section Name">{sectionName}</DetailsField>}
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
};

const CensusCollectorNameDisplay: React.FC<Props> = ({ census }) => {
  const { collectorName, collectorNameShort, collector } = census;
  if (!collectorName && !collectorNameShort && !collector) return null;

  if (collector) {
    return (
      <DetailsField title="Collected by">
        <HoverableObjectName object={collector} />
      </DetailsField>
    );
  }

  return (
    <DetailsField title="Collected by">
      {collectorName ? collectorName : collectorNameShort}
      {collectorName && collectorNameShort && ` aka ${collectorNameShort}`}
    </DetailsField>
  );
};

export default CensusSourceSection;
