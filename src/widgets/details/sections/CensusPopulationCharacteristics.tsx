import { CensusData } from '@entities/census/CensusTypes';

import { toTitleCase } from '@shared/lib/stringUtils';
import ExternalLink from '@shared/ui/ExternalLink';

import DetailsField from '../ui/DetailsField';
import DetailsSection from '../ui/DetailsSection';

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
          {populationSource.startsWith('http') ? (
            <ExternalLink href={populationSource} />
          ) : (
            populationSource
          )}
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

export default CensusPopulationCharacteristics;
