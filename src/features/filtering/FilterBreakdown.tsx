import { XIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import HoverableButton from '@features/hovercard/HoverableButton';
import usePageParams from '@features/page-params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import {
  getFilterBySubstring,
  getFilterByTerritory,
  getFilterByVitality,
  getScopeFilter,
} from './filter';

type FilterExplanationProps = {
  objects: ObjectData[];
  shouldFilterUsingSearchBar?: boolean;
};

const FilterBreakdown: React.FC<FilterExplanationProps> = ({
  objects,
  shouldFilterUsingSearchBar = true,
}) => {
  const { territoryFilter, updatePageParams, searchString } = usePageParams();
  const filterBySubstring = shouldFilterUsingSearchBar ? getFilterBySubstring() : () => true;
  const filterByTerritory = getFilterByTerritory();
  const filterByScope = getScopeFilter();
  const filterByVitality = getFilterByVitality();

  const [nInScope, nInTerritory, nInVitality, nMatchingSubstring] = useMemo(() => {
    const filteredByScope = objects.filter(filterByScope);
    const filteredByTerritory = filteredByScope.filter(filterByTerritory);
    const filteredByVitality = filteredByTerritory.filter(filterByVitality);
    const filteredBySubstring = filteredByVitality.filter(filterBySubstring);
    return [
      filteredByScope.length,
      filteredByTerritory.length,
      filteredByVitality.length,
      filteredBySubstring.length,
    ];
  }, [objects, filterByScope, filterByTerritory, filterByVitality, filterBySubstring]);

  const nOverall = objects.length;
  const nFilteredByScope = nOverall - nInScope;
  const nFilteredByTerritory = nInScope - nInTerritory;
  const nFilteredByVitality = nInTerritory - nInVitality;
  const nFilteredBySubstring = nInVitality - nMatchingSubstring;
  if (nOverall === 0) {
    return 'Data is still loading. If you are waiting awhile there could be an error in the data.';
  }
  if (
    nFilteredByScope === 0 &&
    nFilteredByTerritory === 0 &&
    nFilteredByVitality === 0 &&
    nFilteredBySubstring === 0
  ) {
    return null;
  }

  return (
    <table>
      <tbody>
        {nFilteredByScope > 0 && (
          <tr>
            <td style={{ textAlign: 'left' }}>Out of scope:</td>
            <td className="numeric">{nFilteredByScope.toLocaleString()}</td>
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
            <td style={{ textAlign: 'left' }}>Not in territory ({territoryFilter}):</td>
            <td className="numeric">{nFilteredByTerritory.toLocaleString()}</td>
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
        {nFilteredByVitality > 0 && (
          <tr>
            <td style={{ textAlign: 'left' }}>Not passing vitality filter:</td>
            <td className="numeric">{nFilteredByVitality.toLocaleString()}</td>
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
            <td style={{ textAlign: 'left' }}>Not matching substring ({searchString}):</td>
            <td className="numeric">{nFilteredBySubstring.toLocaleString()}</td>
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
      </tbody>
    </table>
  );
};

export default FilterBreakdown;
