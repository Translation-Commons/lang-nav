import { XIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import usePageParams from '@features/params/usePageParams';

import { getObjectTypeLabelPlural } from '@entities/lib/getObjectName';
import { ObjectData } from '@entities/types/DataTypes';

import Field from '../fields/Field';
import getFilterBySubstring from '../search/getFilterBySubstring';

import { getFilterByVitality, getFilterByPopulation } from './filter';
import { getFilterLabels } from './FilterLabels';
import useFilters from './useFilters';

type FilterExplanationProps = {
  objects: ObjectData[];
  shouldFilterUsingSearchBar?: boolean;
};

const FilterBreakdown: React.FC<FilterExplanationProps> = ({
  objects,
  shouldFilterUsingSearchBar = true,
}) => {
  const { updatePageParams, searchString } = usePageParams();
  const filterBy = useFilters();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByVitality = getFilterByVitality();
  const filterByPopulation = getFilterByPopulation();
  const filterLabels = getFilterLabels();

  const [
    nInLanguageScope,
    nInModality,
    nInTerritoryScope,
    nInTerritory,
    nWrittenIn,
    nWithLanguage,
    nInVitality,
    nMatchingPopulation,
    nMatchingSubstring,
  ] = (() => {
    const filteredByLanguageScope = objects.filter(filterBy[Field.LanguageScope]);
    const filteredByModality = filteredByLanguageScope.filter(filterBy[Field.Modality]);
    const filteredByTerritoryScope = filteredByModality.filter(filterBy[Field.TerritoryScope]);
    const filteredByTerritory = filteredByTerritoryScope.filter(filterBy[Field.Territory]);
    const filteredByWritingSystem = filteredByTerritory.filter(filterBy[Field.WritingSystem]);
    const filteredByLanguage = filteredByWritingSystem.filter(filterBy[Field.Language]);
    const filteredByVitality = filteredByLanguage.filter(filterByVitality);
    const filteredByPopulation = filteredByVitality.filter(filterByPopulation);
    const filteredBySubstring = filteredByPopulation.filter(filterBySubstring);
    return [
      filteredByLanguageScope.length,
      filteredByModality.length,
      filteredByTerritoryScope.length,
      filteredByTerritory.length,
      filteredByWritingSystem.length,
      filteredByLanguage.length,
      filteredByVitality.length,
      filteredByPopulation.length,
      filteredBySubstring.length,
    ];
  })();

  const nOverall = objects.length;
  const nFilteredByLanguageScope = nOverall - nInLanguageScope;
  const nFilteredByModality = nInLanguageScope - nInModality;
  const nFilteredByTerritoryScope = nInModality - nInTerritoryScope;
  const nFilteredByTerritory = nInTerritoryScope - nInTerritory;
  const nFilteredByWritingSystem = nInTerritory - nWrittenIn;
  const nFilteredByLanguage = nWrittenIn - nWithLanguage;
  const nFilteredByVitality = nWithLanguage - nInVitality;
  const nFilteredByPopulation = nInVitality - nMatchingPopulation;
  const nFilteredBySubstring = nMatchingPopulation - nMatchingSubstring;
  if (nOverall === 0) {
    return 'Data is still loading. If you are waiting awhile there could be an error in the data.';
  }

  // Return an empty component if nothing was filtered
  if (nOverall === nMatchingSubstring) return null;

  return (
    <table style={{ textAlign: 'left' }}>
      <tbody>
        <tr>
          <td>All {getObjectTypeLabelPlural(objects[0].type)}</td>
          <td className="count">{nOverall.toLocaleString()}</td>
        </tr>
        {nFilteredByLanguageScope > 0 && (
          <tr>
            <td>Not {filterLabels.languageScope}:</td>
            <td className="count">{(nFilteredByLanguageScope * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the language scope filter"
                onClick={() => updatePageParams({ languageScopes: [] })}
                style={{ padding: '0.25em', marginLeft: '0.25em' }}
              >
                <XIcon size="1em" display="block" />
              </HoverableButton>
            </td>
          </tr>
        )}
        {nFilteredByModality > 0 && (
          <tr>
            <td>Not {filterLabels.modalityFilter}:</td>
            <td className="count">{(nFilteredByModality * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the modality filter"
                onClick={() => updatePageParams({ modalityFilter: [] })}
                style={{ padding: '0.25em', marginLeft: '0.25em' }}
              >
                <XIcon size="1em" display="block" />
              </HoverableButton>
            </td>
          </tr>
        )}
        {nFilteredByTerritoryScope > 0 && (
          <tr>
            <td>Not {filterLabels.territoryScope}:</td>
            <td className="count">{(nFilteredByTerritoryScope * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the territory scope filter"
                onClick={() => updatePageParams({ territoryScopes: [] })}
                style={{ padding: '0.25em', marginLeft: '0.25em' }}
              >
                <XIcon size="1em" display="block" />
              </HoverableButton>
            </td>
          </tr>
        )}
        {nFilteredByTerritory > 0 && (
          <tr>
            <td>Not {filterLabels.territoryFilter}:</td>
            <td className="count">{(nFilteredByTerritory * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the territory filter"
                onClick={() => updatePageParams({ territoryFilter: '' })}
                style={{ padding: '0.25em', marginLeft: '0.25em' }}
              >
                <XIcon size="1em" display="block" />
              </HoverableButton>
            </td>
          </tr>
        )}
        {nFilteredByWritingSystem > 0 && (
          <tr>
            <td>Not {filterLabels.writingSystemFilter}:</td>
            <td className="count">{(nFilteredByWritingSystem * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the writing system filter"
                onClick={() => updatePageParams({ writingSystemFilter: '' })}
                style={{ padding: '0.25em', marginLeft: '0.25em' }}
              >
                <XIcon size="1em" display="block" />
              </HoverableButton>
            </td>
          </tr>
        )}
        {nFilteredByLanguage > 0 && (
          <tr>
            <td>Not {filterLabels.languageFilter}:</td>
            <td className="count">{(nFilteredByLanguage * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the language filter"
                onClick={() => updatePageParams({ languageFilter: '' })}
                style={{ padding: '0.25em', marginLeft: '0.25em' }}
              >
                <XIcon size="1em" display="block" />
              </HoverableButton>
            </td>
          </tr>
        )}
        {nFilteredByVitality > 0 && (
          <tr>
            <td>Not passing vitality filter:</td>
            <td className="count">{(nFilteredByVitality * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the vitality filters"
                onClick={() =>
                  updatePageParams({ vitalityEthCoarse: [], isoStatus: [], vitalityEthFine: [] })
                }
                style={{ padding: '0.25em', marginLeft: '0.25em' }}
              >
                <XIcon size="1em" display="block" />
              </HoverableButton>
            </td>
          </tr>
        )}
        {nFilteredByPopulation > 0 && (
          <tr>
            <td>Not passing population filter:</td>
            <td className="count">{(nFilteredByPopulation * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the population filter"
                onClick={() =>
                  updatePageParams({ populationLowerLimit: undefined, populationUpperLimit: undefined })
                }
                style={{ padding: '0.25em', marginLeft: '0.25em' }}
              >
                <XIcon size="1em" display="block" />
              </HoverableButton>
            </td>
          </tr>
        )}
        {nFilteredBySubstring > 0 && (
          <tr>
            <td>Not matching substring &quot;{searchString}&quot;:</td>
            <td className="count">{(nFilteredBySubstring * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the search string filter"
                onClick={() => updatePageParams({ searchString: '' })}
                style={{ padding: '0.25em', marginLeft: '0.25em' }}
              >
                <XIcon size="1em" display="block" />
              </HoverableButton>
            </td>
          </tr>
        )}
        <tr>
          <td style={{ fontWeight: 'bold', borderTop: '2px solid var(--color-button-primary)' }}>
            Results
          </td>
          <td className="count" style={{ borderTop: '2px solid var(--color-button-primary)' }}>
            {nMatchingSubstring.toLocaleString()}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default FilterBreakdown;
