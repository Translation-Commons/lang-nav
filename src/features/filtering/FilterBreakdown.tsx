import { XIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import HoverableButton from '@features/hovercard/HoverableButton';
import usePageParams from '@features/page-params/usePageParams';

import { getObjectTypeLabelPlural } from '@entities/lib/getObjectName';
import { ObjectData } from '@entities/types/DataTypes';

import { getFilterBySubstring, getFilterByVitality, getScopeFilter } from './filter';
import {
  getFilterByLanguage,
  getFilterByTerritory,
  getFilterByWritingSystem,
} from './filterByConnections';

type FilterExplanationProps = {
  objects: ObjectData[];
  shouldFilterUsingSearchBar?: boolean;
};

const FilterBreakdown: React.FC<FilterExplanationProps> = ({
  objects,
  shouldFilterUsingSearchBar = true,
}) => {
  const { territoryFilter, writingSystemFilter, languageFilter, updatePageParams, searchString } =
    usePageParams();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByTerritory = getFilterByTerritory();
  const filterByWritingSystem = getFilterByWritingSystem();
  const filterByLanguage = getFilterByLanguage();
  const filterByScope = getScopeFilter();
  const filterByVitality = getFilterByVitality();

  const [nInScope, nInTerritory, nWrittenIn, nWithLanguage, nInVitality, nMatchingSubstring] =
    useMemo(() => {
      const filteredByScope = objects.filter(filterByScope);
      const filteredByTerritory = filteredByScope.filter(filterByTerritory);
      const filteredByWritingSystem = filteredByTerritory.filter(filterByWritingSystem);
      const filteredByLanguage = filteredByWritingSystem.filter(filterByLanguage);
      const filteredByVitality = filteredByLanguage.filter(filterByVitality);
      const filteredBySubstring = filteredByVitality.filter(filterBySubstring);
      return [
        filteredByScope.length,
        filteredByTerritory.length,
        filteredByWritingSystem.length,
        filteredByLanguage.length,
        filteredByVitality.length,
        filteredBySubstring.length,
      ];
    }, [
      objects,
      filterByScope,
      filterByTerritory,
      filterByWritingSystem,
      filterByLanguage,
      filterByVitality,
      filterBySubstring,
    ]);

  const nOverall = objects.length;
  const nFilteredByScope = nOverall - nInScope;
  const nFilteredByTerritory = nInScope - nInTerritory;
  const nFilteredByWritingSystem = nInTerritory - nWrittenIn;
  const nFilteredByLanguage = nWrittenIn - nWithLanguage;
  const nFilteredByVitality = nWithLanguage - nInVitality;
  const nFilteredBySubstring = nInVitality - nMatchingSubstring;
  if (nOverall === 0) {
    return 'Data is still loading. If you are waiting awhile there could be an error in the data.';
  }

  // Return an empty component if nothing was filtered
  if (nOverall === nMatchingSubstring) return null;

  // Cut out the codes if the filter is a combination of name + code, eg. "India [IN]"
  const formattedTerritoryFilter = territoryFilter.split('[')[0].trim();
  const formattedWritingFilter = writingSystemFilter.split('[')[0].trim(); // cuts out the territory code if its included
  const formattedLanguageFilter = languageFilter.split('[')[0].trim();

  return (
    <table>
      <tbody>
        <tr>
          <td>All {getObjectTypeLabelPlural(objects[0].type)}</td>
          <td className="numeric">{nOverall.toLocaleString()}</td>
        </tr>
        {nFilteredByScope > 0 && (
          <tr>
            <td>Out of scope:</td>
            <td className="numeric">{(nFilteredByScope * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the scope filters"
                onClick={() => updatePageParams({ languageScopes: [], territoryScopes: [] })}
                style={{ padding: '0.25em', marginLeft: '0.25em' }}
              >
                <XIcon size="1em" display="block" />
              </HoverableButton>
            </td>
          </tr>
        )}
        {nFilteredByTerritory > 0 && (
          <tr>
            <td>Not in territory &quot;{formattedTerritoryFilter}&quot;:</td>
            <td className="numeric">{(nFilteredByTerritory * -1).toLocaleString()}</td>
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
            <td>Not written in &quot;{formattedWritingFilter}&quot;:</td>
            <td className="numeric">{(nFilteredByWritingSystem * -1).toLocaleString()}</td>
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
            <td>Not related to language &quot;{formattedLanguageFilter}&quot;:</td>
            <td className="numeric">{(nFilteredByLanguage * -1).toLocaleString()}</td>
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
            <td className="numeric">{(nFilteredByVitality * -1).toLocaleString()}</td>
            <td>
              <HoverableButton
                buttonType="reset"
                hoverContent="Clear the vitality filters"
                onClick={() =>
                  updatePageParams({ vitalityEth2025: [], vitalityISO: [], vitalityEth2013: [] })
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
            <td>Not matching substring ({searchString}):</td>
            <td className="numeric">{(nFilteredBySubstring * -1).toLocaleString()}</td>
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
          <td className="numeric" style={{ borderTop: '2px solid var(--color-button-primary)' }}>
            {nMatchingSubstring.toLocaleString()}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default FilterBreakdown;
