import { XIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import usePageParams from '@features/params/usePageParams';

import { getObjectTypeLabelPlural } from '@entities/lib/getObjectName';
import { ObjectData } from '@entities/types/DataTypes';

import getFilterBySubstring from '../search/getFilterBySubstring';

import { getFilterByLanguageScope, getFilterByTerritoryScope, getFilterByVitality } from './filter';
import {
  getFilterByLanguage,
  getFilterByTerritory,
  getFilterByWritingSystem,
} from './filterByConnections';
import { getFilterLabels } from './FilterLabels';

type FilterExplanationProps = {
  objects: ObjectData[];
  shouldFilterUsingSearchBar?: boolean;
};

const FilterBreakdown: React.FC<FilterExplanationProps> = ({
  objects,
  shouldFilterUsingSearchBar = true,
}) => {
  const { updatePageParams, searchString } = usePageParams();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByTerritory = getFilterByTerritory();
  const filterByWritingSystem = getFilterByWritingSystem();
  const filterByLanguage = getFilterByLanguage();
  const filterByLanguageScope = getFilterByLanguageScope();
  const filterByTerritoryScope = getFilterByTerritoryScope();
  const filterByVitality = getFilterByVitality();
  const filterLabels = getFilterLabels();

  const [
    nInLanguageScope,
    nInTerritoryScope,
    nInTerritory,
    nWrittenIn,
    nWithLanguage,
    nInVitality,
    nMatchingSubstring,
  ] = useMemo(() => {
    const filteredByLanguageScope = objects.filter(filterByLanguageScope);
    const filteredByTerritoryScope = filteredByLanguageScope.filter(filterByTerritoryScope);
    const filteredByTerritory = filteredByTerritoryScope.filter(filterByTerritory);
    const filteredByWritingSystem = filteredByTerritory.filter(filterByWritingSystem);
    const filteredByLanguage = filteredByWritingSystem.filter(filterByLanguage);
    const filteredByVitality = filteredByLanguage.filter(filterByVitality);
    const filteredBySubstring = filteredByVitality.filter(filterBySubstring);
    return [
      filteredByLanguageScope.length,
      filteredByTerritoryScope.length,
      filteredByTerritory.length,
      filteredByWritingSystem.length,
      filteredByLanguage.length,
      filteredByVitality.length,
      filteredBySubstring.length,
    ];
  }, [
    objects,
    filterByLanguageScope,
    filterByTerritoryScope,
    filterByTerritory,
    filterByWritingSystem,
    filterByLanguage,
    filterByVitality,
    filterBySubstring,
  ]);

  const nOverall = objects.length;
  const nFilteredByLanguageScope = nOverall - nInLanguageScope;
  const nFilteredByTerritoryScope = nInLanguageScope - nInTerritoryScope;
  const nFilteredByTerritory = nInTerritoryScope - nInTerritory;
  const nFilteredByWritingSystem = nInTerritory - nWrittenIn;
  const nFilteredByLanguage = nWrittenIn - nWithLanguage;
  const nFilteredByVitality = nWithLanguage - nInVitality;
  const nFilteredBySubstring = nInVitality - nMatchingSubstring;
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
                  updatePageParams({ vitalityEth2025: [], isoStatus: [], vitalityEth2013: [] })
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
